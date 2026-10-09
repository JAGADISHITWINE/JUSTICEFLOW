import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'jf-theme-preference';
  private themeSubject: BehaviorSubject<AppTheme>;
  public theme$: Observable<AppTheme>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const initialTheme = this.getInitialTheme();
    this.themeSubject = new BehaviorSubject<AppTheme>(initialTheme);
    this.theme$ = this.themeSubject.asObservable();

    if (isPlatformBrowser(this.platformId)) {
      this.applyTheme(initialTheme);
      this.watchSystemTheme();
    }
  }

  /**
   * Returns current active theme ('light' or 'dark')
   */
  public get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  /**
   * True if current theme is dark (Night mode)
   */
  public get isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  /**
   * Toggle between Day (light) and Night (dark) mode
   */
  public toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  /**
   * Set specific theme
   */
  public setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.THEME_KEY, theme);
      } catch (e) {
        console.warn('Could not store theme in localStorage', e);
      }
      this.applyTheme(theme);
    }
  }

  private getInitialTheme(): AppTheme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    try {
      const stored = localStorage.getItem(this.THEME_KEY) as AppTheme | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // Default fallback
    }

    return 'light';
  }

  private applyTheme(theme: AppTheme): void {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
      root.classList.remove('light-theme');
      body.classList.remove('light-theme');
    } else {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
      root.classList.add('light-theme');
      body.classList.add('light-theme');
    }
  }

  private watchSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only adapt if user hasn't manually set a preference
        try {
          if (!localStorage.getItem(this.THEME_KEY)) {
            this.setTheme(e.matches ? 'dark' : 'light');
          }
        } catch {
          // ignore
        }
      });
    }
  }
}
