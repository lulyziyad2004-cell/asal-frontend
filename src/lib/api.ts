/**
 * API Client for Laravel Backend
 * Direct HTTP API calls to the Asal Laravel backend
 */

import type {
  AuditLog,
  CaseItem,
  Document,
  Hearing,
  Invoice,
  Message,
  Notification,
  SubscriptionPlan,
  MySubscription,
  SubscriptionRecord,
  User,
} from '@/types/api';

// Asal Laravel Backend
const API_BASE_URL = 'https://asal-backend-2.onrender.com/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const normalizedBase = this.baseUrl.endsWith('/')
      ? this.baseUrl
      : `${this.baseUrl}/`;

    const normalizedEndpoint = endpoint.replace(/^\/+/, '');
    const url = new URL(normalizedEndpoint, normalizedBase);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...Object.fromEntries(
        Object.entries(options.headers || {}).map(([key, value]) => [
          key,
          String(value),
        ])
      ),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
    }

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(
        data?.error ||
          data?.message ||
          `API Error: ${response.status}`
      );

      (error as any).status = response.status;
      throw error;
    }

    return data as T;
  }

  // =========================
  // Auth
  // =========================

  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    city?: string;
    specialty?: string;
  }) {
    const data = await this.request<{ token: string; user: any }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    this.saveToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    this.saveToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  // =========================
  // Cases
  // =========================

  async getCases(filters?: { status?: string }) {
    return this.request<CaseItem[]>('/cases', {
      params: filters,
    });
  }

  async getCase(id: number) {
    return this.request<CaseItem>(`/cases/${id}`);
  }

  async createCase(payload: any) {
    return this.request<CaseItem>('/cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCase(id: number, payload: any) {
    return this.request(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // =========================
  // Hearings
  // =========================

  async getHearings(filters?: { case_id?: number }) {
    return this.request<Hearing[]>('/hearings', {
      params: filters,
    });
  }

  async createHearing(payload: any) {
    return this.request<Hearing>('/hearings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateHearing(id: number, payload: any) {
    return this.request<Hearing>(`/hearings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteHearing(id: number) {
    return this.request(`/hearings/${id}`, {
      method: 'DELETE',
    });
  }

  // =========================
  // Invoices
  // =========================

  async getInvoices() {
    return this.request<Invoice[]>('/invoices');
  }

  async getInvoice(id: number) {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async createInvoice(payload: any) {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async cancelInvoice(id: number) {
    return this.request(`/invoices/${id}/cancel`, {
      method: 'POST',
    });
  }

  async refundInvoice(id: number) {
    return this.request(`/invoices/${id}/refund`, {
      method: 'POST',
    });
  }

  // =========================
  // Payments
  // =========================

  async createPaymentSession(invoiceId: number) {
    return this.request('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({
        invoice_id: invoiceId,
      }),
    });
  }

  async getPaymentStatus(invoiceId: number) {
    return this.request(`/payments/status/${invoiceId}`);
  }

  // =========================
  // Documents
  // =========================

  async getDocuments(filters?: { caseId?: number }) {
    return this.request<Document[]>('/documents', {
      params: filters
        ? {
            case_id: filters.caseId,
          }
        : undefined,
    });
  }

  async uploadDocument(payload: any) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteDocument(id: number) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // =========================
  // Notifications
  // =========================

  async getNotifications() {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationRead(id: number) {
    return this.request(`/notifications/${id}/mark-read`, {
      method: 'POST',
    });
  }

  async deleteNotification(id: number) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // =========================
  // Messages
  // =========================

  async getMessageThread(peerId: number) {
    return this.request<Message[]>(`/messages/thread/${peerId}`);
  }

  async sendMessage(recipientId: number, body: string) {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: recipientId,
        body,
      }),
    });
  }

  async getMessageContacts() {
    return this.request<User[]>('/messages/contacts');
  }

  // =========================
  // Subscriptions
  // =========================

  async getSubscriptionPlans() {
    return this.request<SubscriptionPlan[]>(
      '/subscriptions/plans'
    );
  }

  async getMySubscription() {
    return this.request<MySubscription>(
      '/subscriptions/mine'
    );
  }

  async getMySubscriptionRecords() {
    return this.request<SubscriptionRecord[]>(
      '/subscriptions/my-records'
    );
  }

  async upgradeSubscription(plan: string) {
    return this.request('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        plan,
      }),
    });
  }

  async cancelSubscription(subscriptionId: number) {
    return this.request(
      `/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
      }
    );
  }

  // =========================
  // Admin
  // =========================

  async getStats() {
    return this.request<any>('/admin/stats');
  }

  async getUsers(filters?: { role?: string }) {
    return this.request<User[]>('/admin/users', {
      params: filters,
    });
  }

  async disableUser(id: number) {
    return this.request(`/admin/users/${id}/disable`, {
      method: 'POST',
    });
  }

  async getAuditLogs() {
    return this.request<AuditLog[]>('/admin/audit-logs');
  }

  async getTransactions() {
    return this.request<any[]>('/admin/transactions');
  }

  async getSubscriptions() {
    return this.request<any[]>('/admin/subscriptions');
  }

  async setUserRole(id: number, role: string) {
    return this.request(`/admin/users/${id}/set-role`, {
      method: 'POST',
      body: JSON.stringify({
        role,
      }),
    });
  }

  async suspendUser(id: number, suspended: boolean) {
    return this.request(`/admin/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({
        suspended,
      }),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async setPassword(userId: number, password: string) {
    return this.request('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        password,
      }),
    });
  }

  // =========================
  // Auth State
  // =========================

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const api = new ApiClient();
