import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type PracticeMode = 'Firm' | 'Solo';

@Injectable({
  providedIn: 'root'
})
export class PracticeModeService {
  private readonly STORAGE_KEY_MODE = 'jf_practice_mode_v1';
  private readonly STORAGE_KEY_TEAM = 'jf_active_team_v1';

  private practiceModeSubject = new BehaviorSubject<PracticeMode>('Firm');
  public practiceMode$: Observable<PracticeMode> = this.practiceModeSubject.asObservable();

  private activeTeamSubject = new BehaviorSubject<number | null>(null); // null = All Teams / Whole Firm
  public activeTeam$: Observable<number | null> = this.activeTeamSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem(this.STORAGE_KEY_MODE) as PracticeMode;
      if (savedMode === 'Solo' || savedMode === 'Firm') {
        this.practiceModeSubject.next(savedMode);
      }
      const savedTeam = localStorage.getItem(this.STORAGE_KEY_TEAM);
      if (savedTeam !== null && savedTeam !== 'all') {
        this.activeTeamSubject.next(Number(savedTeam));
      }
    }
  }

  public get currentMode(): PracticeMode {
    return this.practiceModeSubject.value;
  }

  public get isFirmMode(): boolean {
    return this.practiceModeSubject.value === 'Firm';
  }

  public get isSoloMode(): boolean {
    return this.practiceModeSubject.value === 'Solo';
  }

  public get activeTeamId(): number | null {
    return this.activeTeamSubject.value;
  }

  public setPracticeMode(mode: PracticeMode): void {
    this.practiceModeSubject.next(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY_MODE, mode);
    }
  }

  public togglePracticeMode(): void {
    const nextMode: PracticeMode = this.currentMode === 'Firm' ? 'Solo' : 'Firm';
    this.setPracticeMode(nextMode);
  }

  public setActiveTeam(teamId: number | null): void {
    this.activeTeamSubject.next(teamId);
    if (isPlatformBrowser(this.platformId)) {
      if (teamId === null) {
        localStorage.setItem(this.STORAGE_KEY_TEAM, 'all');
      } else {
        localStorage.setItem(this.STORAGE_KEY_TEAM, String(teamId));
      }
    }
  }
}
