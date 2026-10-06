import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
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

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('jf_user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticated$.next(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem('jf_token');
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('jf_token', res.data.token);
          localStorage.setItem('jf_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
          this.isAuthenticated$.next(true);
        }
      })
    );
  }

  register(userData: { name: string; email: string; password: string; role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('jf_token', res.data.token);
          localStorage.setItem('jf_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
          this.isAuthenticated$.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jf_token');
    localStorage.removeItem('jf_user');
    this.currentUserSubject.next(null);
    this.isAuthenticated$.next(false);
    this.router.navigate(['/login']);
  }

  getStaffMembers(): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(`${this.baseUrl}/users`);
  }
}
