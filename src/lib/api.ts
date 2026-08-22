/**
 * API Client for Laravel Backend
 * منصة أصال
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
} from "@/types/api";

const API_BASE_URL =
  "https://asal-backend-2.onrender.com/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(
    baseUrl: string = API_BASE_URL
  ) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    this.token =
      localStorage.getItem("auth_token");
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem(
      "auth_token",
      token
    );
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem(
      "auth_token"
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const normalizedBase =
      this.baseUrl.endsWith("/")
        ? this.baseUrl
        : `${this.baseUrl}/`;

    const normalizedEndpoint =
      endpoint.replace(/^\/+/, "");

    const url = new URL(
      normalizedEndpoint,
      normalizedBase
    );

    if (options.params) {
      Object.entries(options.params).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            url.searchParams.append(
              key,
              String(value)
            );
          }
        }
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Requested-With":
        "XMLHttpRequest",
    };

    if (options.headers) {
      Object.entries(
        options.headers
      ).forEach(([key, value]) => {
        if (value !== undefined) {
          headers[key] = String(value);
        }
      });
    }

    /*
     * لا نضع Content-Type يدوياً
     * عندما يكون الطلب FormData.
     *
     * المتصفح سيضع:
     * multipart/form-data
     * مع boundary الصحيح تلقائياً.
     */
    if (
      !(options.body instanceof FormData)
    ) {
      headers["Content-Type"] =
        "application/json";
    }

    /*
     * تحديث التوكن قبل كل طلب
     * حتى نأخذ آخر قيمة موجودة في المتصفح.
     */
    this.loadToken();

    if (this.token) {
      headers.Authorization =
        `Bearer ${this.token}`;
    }

    const response = await fetch(
      url.toString(),
      {
        ...options,
        headers,
      }
    );

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
      const validationErrors =
        data?.errors
          ? Object.values(data.errors)
              .flat()
              .join(" ")
          : null;

      const error = new Error(
        data?.message ||
          data?.error ||
          validationErrors ||
          `API Error: ${response.status}`
      );

      (error as any).status =
        response.status;

      (error as any).data = data;

      throw error;
    }

    return data as T;
  }

  // =========================================================
  // AUTH
  // =========================================================

  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    city?: string;
    specialty?: string;
  }) {
    const data =
      await this.request<{
        token: string;
        user: any;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      });

    if (data.token) {
      this.saveToken(data.token);
    }

    return data;
  }

  async login(
    email: string,
    password: string
  ) {
    const data =
      await this.request<{
        token: string;
        user: any;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

    if (data.token) {
      this.saveToken(data.token);
    }

    return data;
  }

  async logout() {
    try {
      await this.request(
        "/auth/logout",
        {
          method: "POST",
        }
      );
    } finally {
      this.clearToken();
    }
  }

  async getMe() {
    return this.request<User>(
      "/auth/me"
    );
  }

  async setPassword(
    userId: number,
    password: string
  ) {
    return this.request(
      "/auth/set-password",
      {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          password,
        }),
      }
    );
  }

  // =========================================================
  // CASES
  // =========================================================

  async getCases(filters?: {
    status?: string;
  }) {
    return this.request<CaseItem[]>(
      "/cases",
      {
        params: filters,
      }
    );
  }

  async getCase(id: number) {
    return this.request<CaseItem>(
      `/cases/${id}`
    );
  }

  async createCase(payload: any) {
    return this.request<CaseItem>(
      "/cases",
      {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      }
    );
  }

  async updateCase(
    id: number,
    payload: any
  ) {
    return this.request(
      `/cases/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(
          payload
        ),
      }
    );
  }

  // =========================================================
  // HEARINGS
  // =========================================================

  async getHearings(filters?: {
    case_id?: number;
  }) {
    return this.request<Hearing[]>(
      "/hearings",
      {
        params: filters,
      }
    );
  }

  async createHearing(payload: any) {
    return this.request<Hearing>(
      "/hearings",
      {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      }
    );
  }

  async updateHearing(
    id: number,
    payload: any
  ) {
    return this.request<Hearing>(
      `/hearings/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(
          payload
        ),
      }
    );
  }

  async deleteHearing(id: number) {
    return this.request(
      `/hearings/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // =========================================================
  // INVOICES
  // =========================================================

  async getInvoices() {
    return this.request<Invoice[]>(
      "/invoices"
    );
  }

  async getInvoice(id: number) {
    return this.request<Invoice>(
      `/invoices/${id}`
    );
  }

  async createInvoice(payload: any) {
    return this.request<Invoice>(
      "/invoices",
      {
        method: "POST",
        body: JSON.stringify(
          payload
        ),
      }
    );
  }

  async cancelInvoice(id: number) {
    return this.request(
      `/invoices/${id}/cancel`,
      {
        method: "POST",
      }
    );
  }

  async refundInvoice(id: number) {
    return this.request(
      `/invoices/${id}/refund`,
      {
        method: "POST",
      }
    );
  }

  // =========================================================
  // PAYMENTS
  // =========================================================

  async createPaymentSession(
    invoiceId: number
  ) {
    return this.request(
      "/payments/create-session",
      {
        method: "POST",
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      }
    );
  }

  async getPaymentStatus(
    invoiceId: number
  ) {
    return this.request(
      `/payments/status/${invoiceId}`
    );
  }

  // =========================================================
  // DOCUMENTS
  // =========================================================

  async getDocuments(filters?: {
    caseId?: number;
  }) {
    return this.request<Document[]>(
      "/documents",
      {
        params: filters
          ? {
              case_id:
                filters.caseId,
            }
          : undefined,
      }
    );
  }

  /**
   * رفع المستندات
   *
   * Laravel يستقبل:
   * file
   * file_name
   * title
   * category
   * case_id اختياري
   * hearing_id اختياري
   *
   * يتم إرسال الملف كـ FormData.
   */
  async uploadDocument(payload: {
    file: File;
    title?: string;
    category?: string;
    case_id?: number;
    hearing_id?: number;
  }) {
    if (
      !(payload.file instanceof File)
    ) {
      throw new Error(
        "لم يتم اختيار ملف صالح"
      );
    }

    /*
     * مهم جداً:
     * نقرأ آخر توكن من localStorage
     * قبل عملية الرفع.
     */
    this.loadToken();

    if (!this.token) {
      throw new Error(
        "انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى."
      );
    }

    const formData =
      new FormData();

    /*
     * الملف الحقيقي
     */
    formData.append(
      "file",
      payload.file,
      payload.file.name
    );

    /*
     * اسم الملف
     */
    formData.append(
      "file_name",
      payload.file.name
    );

    /*
     * العنوان
     */
    formData.append(
      "title",
      payload.title?.trim() ||
        payload.file.name
    );

    /*
     * التصنيف
     */
    formData.append(
      "category",
      payload.category?.trim() ||
        "other"
    );

    /*
     * القضية اختيارية
     */
    if (
      payload.case_id !== undefined &&
      payload.case_id !== null
    ) {
      formData.append(
        "case_id",
        String(payload.case_id)
      );
    }

    /*
     * الجلسة اختيارية
     */
    if (
      payload.hearing_id !==
        undefined &&
      payload.hearing_id !== null
    ) {
      formData.append(
        "hearing_id",
        String(payload.hearing_id)
      );
    }

    /*
     * لا نضع Content-Type هنا.
     *
     * request() سيضيف Authorization
     * تلقائياً ويترك المتصفح يحدد
     * multipart boundary.
     */
    return this.request(
      "/documents",
      {
        method: "POST",
        body: formData,
      }
    );
  }

  async deleteDocument(
    id: number
  ) {
    return this.request(
      `/documents/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  async getNotifications() {
    return this.request<
      Notification[]
    >("/notifications");
  }

  async markNotificationRead(
    id: number
  ) {
    return this.request(
      `/notifications/${id}/mark-read`,
      {
        method: "POST",
      }
    );
  }

  async deleteNotification(
    id: number
  ) {
    return this.request(
      `/notifications/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // =========================================================
  // MESSAGES
  // =========================================================

  async getMessageThread(
    peerId: number
  ) {
    return this.request<Message[]>(
      `/messages/thread/${peerId}`
    );
  }

  async sendMessage(
    recipientId: number,
    body: string
  ) {
    return this.request(
      "/messages/send",
      {
        method: "POST",
        body: JSON.stringify({
          recipient_id:
            recipientId,
          body,
        }),
      }
    );
  }

  async getMessageContacts() {
    return this.request<User[]>(
      "/messages/contacts"
    );
  }

  // =========================================================
  // SUBSCRIPTIONS
  // =========================================================

  async getSubscriptionPlans() {
    return this.request<
      SubscriptionPlan[]
    >("/subscriptions/plans");
  }

  async getMySubscription() {
    return this.request<MySubscription>(
      "/subscriptions/mine"
    );
  }

  async getMySubscriptionRecords() {
    return this.request<
      SubscriptionRecord[]
    >(
      "/subscriptions/my-records"
    );
  }

  async upgradeSubscription(
    plan: string
  ) {
    return this.request(
      "/subscriptions/upgrade",
      {
        method: "POST",
        body: JSON.stringify({
          plan,
        }),
      }
    );
  }

  async cancelSubscription(
    subscriptionId: number
  ) {
    return this.request(
      `/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
      }
    );
  }

  // =========================================================
  // ADMIN
  // =========================================================

  async getStats() {
    return this.request<any>(
      "/admin/stats"
    );
  }

  async getUsers(filters?: {
    role?: string;
  }) {
    return this.request<User[]>(
      "/admin/users",
      {
        params: filters,
      }
    );
  }

  async disableUser(id: number) {
    return this.request(
      `/admin/users/${id}/disable`,
      {
        method: "POST",
      }
    );
  }

  async getAuditLogs() {
    return this.request<AuditLog[]>(
      "/admin/audit-logs"
    );
  }

  async getTransactions() {
    return this.request<any[]>(
      "/admin/transactions"
    );
  }

  async getSubscriptions() {
    return this.request<any[]>(
      "/admin/subscriptions"
    );
  }

  async setUserRole(
    id: number,
    role: string
  ) {
    return this.request(
      `/admin/users/${id}/set-role`,
      {
        method: "POST",
        body: JSON.stringify({
          role,
        }),
      }
    );
  }

  async suspendUser(
    id: number,
    suspended: boolean
  ) {
    return this.request(
      `/admin/users/${id}/suspend`,
      {
        method: "POST",
        body: JSON.stringify({
          suspended,
        }),
      }
    );
  }

  async deleteUser(id: number) {
    return this.request(
      `/admin/users/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // =========================================================
  // AUTH STATE
  // =========================================================

  isAuthenticated() {
    this.loadToken();
    return !!this.token;
  }

  getToken() {
    this.loadToken();
    return this.token;
  }
}

export const api =
  new ApiClient();
