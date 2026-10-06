import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, duration: number = 4000) {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, title, message };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error') {
    this.show('error', message, title, 5000);
  }

  warning(message: string, title: string = 'Warning') {
    this.show('warning', message, title);
  }

  info(message: string, title: string = 'Info') {
    this.show('info', message, title);
  }

  remove(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
