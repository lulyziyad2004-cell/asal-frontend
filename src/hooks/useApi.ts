import { useQuery, useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AuditLog,
  CaseItem,
  Document as APIDocument,
  Hearing,
  Invoice,
  Message as APIMessage,
  Notification,
  SubscriptionPlan,
  MySubscription,
  SubscriptionRecord,
  User,
} from '@/types/api';

// Auth hooks
export function useLogin(options?: UseMutationOptions<any, any, { email: string; password: string }>) {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.login(credentials.email, credentials.password),
    ...options,
  });
}

export function useRegister(options?: UseMutationOptions<any, any, any>) {
  return useMutation({
    mutationFn: (data: any) => api.register(data),
    ...options,
  });
}

export function useLogout(options?: UseMutationOptions<any, any, void>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, void>({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
}

export function useSetPassword(options?: UseMutationOptions<any, any, { userId: number; password: string }>) {
  return useMutation<any, any, { userId: number; password: string }>({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      api.setPassword(userId, password),
    ...options,
  });
}

export function useMe() {
  return useQuery<User, any>({
    queryKey: ['auth', 'me'],
    queryFn: () => api.getMe(),
    retry: false,
  });
}

// Cases hooks
export function useCases(filters?: any) {
  return useQuery<CaseItem[], any>({
    queryKey: ['cases', filters],
    queryFn: () => api.getCases(filters),
  });
}

export function useCase(id: number) {
  return useQuery<CaseItem, any>({
    queryKey: ['cases', id],
    queryFn: () => api.getCase(id),
    enabled: !!id,
  });
}

export function useCreateCase(options?: UseMutationOptions<any, any, Partial<CaseItem>>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, Partial<CaseItem>>({
    mutationFn: (data: Partial<CaseItem>) => api.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    ...options,
  });
}

export function useUpdateCase(options?: UseMutationOptions<any, any, { id: number } & Partial<CaseItem>>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, { id: number } & Partial<CaseItem>>({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CaseItem>) =>
      api.updateCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    ...options,
  });
}

// Hearings hooks
export function useHearings(filters?: any) {
  return useQuery<Hearing[], any>({
    queryKey: ['hearings', filters],
    queryFn: () => api.getHearings(filters),
  });
}

export function useCreateHearing(options?: UseMutationOptions<any, any, Partial<Hearing>>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, Partial<Hearing>>({
    mutationFn: (data: Partial<Hearing>) => api.createHearing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hearings'] });
    },
    ...options,
  });
}

export function useUpdateHearing(options?: UseMutationOptions<any, any, { id: number } & Partial<Hearing>>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, { id: number } & Partial<Hearing>>({
    mutationFn: ({ id, ...data }: { id: number } & Partial<Hearing>) =>
      api.updateHearing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hearings'] });
    },
    ...options,
  });
}

export function useDeleteHearing(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.deleteHearing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hearings'] });
    },
    ...options,
  });
}

// Invoices hooks
export function useInvoices() {
  return useQuery<Invoice[], any>({
    queryKey: ['invoices'],
    queryFn: () => api.getInvoices(),
  });
}

export function useInvoice(id: number) {
  return useQuery<Invoice, any>({
    queryKey: ['invoices', id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    ...options,
  });
}

export function useCancelInvoice(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.cancelInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    ...options,
  });
}

export function useRefundInvoice(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.refundInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    ...options,
  });
}

// Payments hooks
export function useCreatePaymentSession(options?: UseMutationOptions<any, any, { invoiceId: number }>) {
  return useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: number }) => api.createPaymentSession(invoiceId),
    ...options,
  });
}

export function usePaymentStatus(invoiceId: number) {
  return useQuery<any, any>({
    queryKey: ['payments', invoiceId],
    queryFn: () => api.getPaymentStatus(invoiceId),
    enabled: !!invoiceId,
    refetchInterval: 5000,
  });
}

// Documents hooks
export function useDocuments(filters?: any) {
  return useQuery<APIDocument[], any>({
    queryKey: ['documents', filters],
    queryFn: () => api.getDocuments(filters),
  });
}

export function useUploadDocument(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    ...options,
  });
}

export function useDeleteDocument(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    ...options,
  });
}

// Notifications hooks
export function useNotifications() {
  return useQuery<Notification[], any>({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 10000,
  });
}

export function useMarkNotificationRead(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, { id: number }>({
    mutationFn: ({ id }: { id: number }) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
}

export function useDeleteNotification(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
}

// Messages hooks
export function useMessageThread(peerId: number) {
  return useQuery<APIMessage[], any>({
    queryKey: ['messages', peerId],
    queryFn: () => api.getMessageThread(peerId),
    enabled: !!peerId,
  });
}

export function useSendMessage(options?: UseMutationOptions<any, any, { recipientId: number; body: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId, body }: { recipientId: number; body: string }) =>
      api.sendMessage(recipientId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    ...options,
  });
}

export function useMessageContacts() {
  return useQuery<User[], any>({
    queryKey: ['messages', 'contacts'],
    queryFn: () => api.getMessageContacts(),
  });
}

// Subscriptions hooks
export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[], any>({
    queryKey: ['subscriptions', 'plans'],
    queryFn: () => api.getSubscriptionPlans(),
  });
}

export function useMySubscription() {
  return useQuery<MySubscription, any>({
    queryKey: ['subscriptions', 'mine'],
    queryFn: () => api.getMySubscription(),
  });
}

export function useMySubscriptionRecords() {
  return useQuery<SubscriptionRecord[], any>({
    queryKey: ['subscriptions', 'my-records'],
    queryFn: () => api.getMySubscriptionRecords(),
  });
}

export function useUpgradeSubscription(options?: UseMutationOptions<any, any, { plan: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plan }: { plan: string }) => api.upgradeSubscription(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    ...options,
  });
}

export function useCancelSubscription(options?: UseMutationOptions<any, any, { id: number }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    ...options,
  });
}

// Admin hooks
export function useStats() {
  return useQuery<any, any>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.getStats(),
  });
}

export function useUsers(filters?: any) {
  return useQuery<User[], any>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => api.getUsers(filters),
  });
}

export function useDisableUser(options?: UseMutationOptions<any, any, number>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, number>({
    mutationFn: (id: number) => api.disableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options,
  });
}

export function useSetUserRole(options?: UseMutationOptions<any, any, { userId: number; role: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      api.setUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options,
  });
}

export function useSuspendUser(options?: UseMutationOptions<any, any, { userId: number; suspended: boolean }>) {
  const queryClient = useQueryClient();
  return useMutation<any, any, { userId: number; suspended: boolean }>({
    mutationFn: ({ userId, suspended }: { userId: number; suspended: boolean }) =>
      api.suspendUser(userId, suspended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options,
  });
}

export function useDeleteUser(options?: UseMutationOptions<any, any, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options,
  });
}

export function useAuditLogs() {
  return useQuery<AuditLog[], any>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => api.getAuditLogs(),
  });
}

export function useTransactions() {
  return useQuery<any[], any>({
    queryKey: ['admin', 'transactions'],
    queryFn: () => api.getTransactions(),
  });
}

export function useSubscriptions() {
  return useQuery<any[], any>({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => api.getSubscriptions(),
  });
}
