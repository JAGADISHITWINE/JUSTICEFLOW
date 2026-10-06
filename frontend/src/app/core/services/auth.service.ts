import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, interval, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

interface AuthResponse {
  success: boolean;
  message?: string;
  isConcurrentSession?: boolean;
  remainingMinutes?: number;
  data: {
    token: string;
    user: User;
    sessionDurationMinutes?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  // Remaining seconds observable preserved for interface compatibility (kept at stable value)
  public readonly SESSION_MAX_SECONDS = 86400; // Persistent full-day session
  private remainingSecondsSubject = new BehaviorSubject<number>(this.SESSION_MAX_SECONDS);
  public remainingSeconds$ = this.remainingSecondsSubject.asObservable();

  private heartbeatTimerSub: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = sessionStorage.getItem('jf_user') || localStorage.getItem('jf_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticated$.next(true);
        this.startSessionTimers();
      } catch (e) {
        this.logout();
      }
    } else {
      this.clearSessionStorage();
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return sessionStorage.getItem('jf_token') || localStorage.getItem('jf_token');
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !!this.currentUserValue;
  }

  private startSessionTimers(): void {
    this.stopSessionTimers();

    this.ngZone.runOutsideAngular(() => {
      // Periodic heartbeat to backend (every 25 seconds) to keep session activity synchronized in MySQL
      this.heartbeatTimerSub = interval(25 * 1000).subscribe(() => {
        if (this.isLoggedIn()) {
          this.http.post<{ success: boolean }>(`${this.baseUrl}/heartbeat`, {})
            .subscribe({
              next: () => {},
              error: () => {}
            });
        }
      });
    });
  }

  private stopSessionTimers(): void {
    if (this.heartbeatTimerSub) {
      this.heartbeatTimerSub.unsubscribe();
      this.heartbeatTimerSub = null;
    }
  }

  private clearSessionStorage(): void {
    sessionStorage.removeItem('jf_token');
    sessionStorage.removeItem('jf_user');
    sessionStorage.removeItem('jf_session_start');
    localStorage.removeItem('jf_token');
    localStorage.removeItem('jf_user');
    localStorage.removeItem('jf_session_start');
  }

  login(credentials: { email: string; password: string; forceUnlock?: boolean; currentToken?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          const now = Date.now();

          // Store in both sessionStorage and localStorage
          sessionStorage.setItem('jf_token', res.data.token);
          sessionStorage.setItem('jf_user', JSON.stringify(res.data.user));
          sessionStorage.setItem('jf_session_start', now.toString());

          localStorage.setItem('jf_token', res.data.token);
          localStorage.setItem('jf_user', JSON.stringify(res.data.user));
          localStorage.setItem('jf_session_start', now.toString());

          this.currentUserSubject.next(res.data.user);
          this.isAuthenticated$.next(true);
          this.remainingSecondsSubject.next(this.SESSION_MAX_SECONDS);

          this.startSessionTimers();
        }
      })
    );
  }

  register(userData: { name: string; email: string; password: string; role?: string; otp?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.data) {
          const now = Date.now();
          sessionStorage.setItem('jf_token', res.data.token);
          sessionStorage.setItem('jf_user', JSON.stringify(res.data.user));
          sessionStorage.setItem('jf_session_start', now.toString());

          localStorage.setItem('jf_token', res.data.token);
          localStorage.setItem('jf_user', JSON.stringify(res.data.user));
          localStorage.setItem('jf_session_start', now.toString());

          this.currentUserSubject.next(res.data.user);
          this.isAuthenticated$.next(true);
          this.remainingSecondsSubject.next(this.SESSION_MAX_SECONDS);

          this.startSessionTimers();
        }
      })
    );
  }

  sendRegistrationOtp(email: string): Observable<{ success: boolean; message: string; otp?: string; email: string }> {
    return this.http.post<{ success: boolean; message: string; otp?: string; email: string }>(`${this.baseUrl}/send-registration-otp`, { email });
  }

  sendPasswordResetCode(email: string): Observable<{ success: boolean; message: string; otp?: string; email: string }> {
    return this.http.post<{ success: boolean; message: string; otp?: string; email: string }>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/reset-password`, data);
  }

  logout(isTimeout = false, message?: string): void {
    const user = this.currentUserValue;
    const token = this.getToken();

    this.stopSessionTimers();

    // Notify backend to release active single-session lock in MySQL
    if (user && user.id && token) {
      this.http.post(`${this.baseUrl}/logout`, { userId: user.id }).subscribe({
        next: () => {},
        error: () => {}
      });
    }

    this.clearSessionStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticated$.next(false);
    this.remainingSecondsSubject.next(this.SESSION_MAX_SECONDS);

    // Redirect to login page with optional alert query param
    const queryParams: any = {};
    if (isTimeout) {
      queryParams.timeout = '1';
      if (message) queryParams.msg = message;
    }
    this.router.navigate(['/login'], { queryParams });
  }

  getStaffMembers(): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(`${this.baseUrl}/users`);
  }
}
