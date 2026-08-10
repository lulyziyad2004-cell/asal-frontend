export type UserRole = 'admin' | 'lawyer' | 'consultant' | 'client';

export type User = {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
  status?: string;
  phone?: string;
  city?: string;
  specialty?: string;
};

export type Notification = {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  isRead: 'yes' | 'no';
  createdAt?: string;
};

export type AuditLog = {
  id: number;
  createdAt: string;
  actorId?: number;
  actorRole?: UserRole;
  action: string;
  details?: string;
  ipAddress?: string;
};

export type CaseItem = {
  id: number;
  title: string;
  description?: string;
  clientId: number;
  lawyerId?: number;
  consultantId?: number;
  caseNumber?: string;
  status: string;
  court?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Hearing = {
  id: number;
  caseId: number;
  title: string;
  description?: string;
  status?: string;
  court?: string;
  city?: string;
  circuitNumber?: string;
  scheduledAt?: string;
  defenseNotes?: string;
  requirements?: string;
  lawyerId?: number;
  consultantId?: number;
  createdAt?: string;
};

export type Invoice = {
  id: number;
  caseId?: number;
  title: string;
  amount: number;
  status: string;
  currency?: string;
  invoiceNumber?: string;
  dueDate?: string;
  clientId?: number;
  createdAt?: string;
};

export type Document = {
  id: number;
  title: string;
  fileName: string;
  fileUrl: string;
  category: string;
  sizeBytes?: number;
  caseId?: number;
  uploaderRole?: UserRole;
  uploaderId?: number;
  createdAt?: string;
};

export type Message = {
  id: number;
  senderId: number;
  recipientId?: number;
  body: string;
  createdAt: string;
};

export type SubscriptionPlan = {
  plan: string;
  name: string;
  price: number;
  features: string[];
};

export type MySubscription = {
  plan: string;
  status: string;
  expiresAt?: string;
};

export type SubscriptionRecord = {
  id: number;
  userId: number;
  plan: string;
  status: string;
  expiresAt?: string;
};
