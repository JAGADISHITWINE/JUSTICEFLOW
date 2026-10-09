import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

export type NotificationCategory = 'hearing' | 'billing' | 'retainer' | 'conflict' | 'document' | 'system';
export type NotificationPriority = 'normal' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string;
  isRead: boolean;
  link?: string;
  badgeText?: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'jf_notifications_v1';

  // Toasts for transient floating feedback
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  // Notification Center Inbox for persistent advocate alerts
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  public unreadCount$: Observable<number> = this.notifications$.pipe(
    map(list => list.filter(n => !n.isRead).length)
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNotifications();
    }
  }

  // Toast API
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

  // ==========================================
  // Notification Center Inbox API
  // ==========================================
  public get notifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  public get unreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.isRead).length;
  }

  public markAsRead(id: string): void {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.saveNotifications(updated);
  }

  public markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
  }

  public removeNotification(id: string): void {
    const updated = this.notificationsSubject.value.filter(n => n.id !== id);
    this.saveNotifications(updated);
  }

  public clearAll(): void {
    this.saveNotifications([]);
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'createdAt'>): void {
    const item: AppNotification = {
      ...notification,
      id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: Date.now()
    };
    const updated = [item, ...this.notificationsSubject.value];
    this.saveNotifications(updated);
  }

  private saveNotifications(list: AppNotification[]): void {
    this.notificationsSubject.next(list);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('Failed to save notifications to localStorage', e);
      }
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notificationsSubject.next(parsed);
          return;
        }
      }
    } catch {
      // Fallback to default authentic legal notifications
    }

    // Default authentic notifications aligned with our Indian practice cases
    const initial: AppNotification[] = [
      {
        id: 'notif_1',
        title: 'Court Cause List Notice: Comm. O.S. 481/2026',
        message: 'Listed for Order XXXIX Interim Injunction arguments tomorrow at 11:00 AM before Court Hall No. 4 (Hon\'ble Justice R. Devdas).',
        category: 'hearing',
        priority: 'critical',
        timestamp: '15 mins ago',
        isRead: false,
        link: '/calendar',
        badgeText: 'Bengaluru Commercial Court',
        createdAt: Date.now() - 15 * 60 * 1000
      },
      {
        id: 'notif_2',
        title: 'Statutory 30-Day Written Statement Window',
        message: 'Commercial Courts Act 2015: Statutory 30-day forfeiture window expires on May 15, 2026 for QuickFreight Logistics.',
        category: 'hearing',
        priority: 'critical',
        timestamp: '1 hour ago',
        isRead: false,
        link: '/calendar',
        badgeText: 'Order VIII Rule 1 CPC',
        createdAt: Date.now() - 60 * 60 * 1000
      },
      {
        id: 'notif_3',
        title: 'Retainer Agreement Executed: Apex Global Logistics',
        message: 'Vakalatnama & Engagement terms signed by Director Rajesh Sharma. ₹1,50,000 advanced to dedicated client trust escrow.',
        category: 'retainer',
        priority: 'high',
        timestamp: '2 hours ago',
        isRead: false,
        link: '/retainers',
        badgeText: 'BCI Rule 24 Escrow',
        createdAt: Date.now() - 2 * 60 * 60 * 1000
      },
      {
        id: 'notif_4',
        title: 'Invoice Due Reminder: INV-2026-002 (₹41,300)',
        message: 'Professional appearance fee invoice for Commercial Court Order 39 hearing is due in 6 days.',
        category: 'billing',
        priority: 'high',
        timestamp: '4 hours ago',
        isRead: false,
        link: '/invoices',
        badgeText: 'Payment Pending',
        createdAt: Date.now() - 4 * 60 * 60 * 1000
      },
      {
        id: 'notif_5',
        title: 'Emergency Section 9 Arbitration Petition Registered',
        message: 'Adani Energy v. BHPC listed before Delhi High Court (Narula, J.) for urgent Bank Guarantee interim protection.',
        category: 'document',
        priority: 'high',
        timestamp: 'Yesterday',
        isRead: true,
        link: '/cases',
        badgeText: 'Delhi High Court',
        createdAt: Date.now() - 24 * 60 * 60 * 1000
      },
      {
        id: 'notif_6',
        title: 'BCI Rule 33 Ethical Conflict Cleared: Sterling Capital',
        message: 'SAT regulatory appeal cleared with Risk Score 0. Bar Council Compliance Certificate BCI-CERT-2026-003 generated.',
        category: 'conflict',
        priority: 'normal',
        timestamp: '2 days ago',
        isRead: true,
        link: '/conflicts',
        badgeText: 'Ethics Cleared',
        createdAt: Date.now() - 48 * 60 * 60 * 1000
      },
      {
        id: 'notif_7',
        title: 'Professional Fee Disbursed: INV-2026-001 (₹59,000)',
        message: 'Apex Global Logistics cleared invoice for Plaint drafting & filing (18% GST included). Escrow ledger reconciled.',
        category: 'billing',
        priority: 'normal',
        timestamp: '3 days ago',
        isRead: true,
        link: '/invoices',
        badgeText: 'Disbursed',
        createdAt: Date.now() - 72 * 60 * 60 * 1000
      }
    ];

    this.saveNotifications(initial);
  }
}
