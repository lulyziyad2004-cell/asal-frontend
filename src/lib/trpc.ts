import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

type QueryKey = readonly unknown[];

function useQueryBase<TData, TError = Error>(
  key: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError, TData, QueryKey>
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError, TData, QueryKey>({
    queryKey: key,
    queryFn,
    ...options,
  });
}

function useMutationBase<TData, TVariables = unknown, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, unknown>, 'mutationFn'>
): UseMutationResult<TData, TError, TVariables> {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
  });
}

function buildUtils() {
  const queryClient = useQueryClient();

  const build = (key: QueryKey) => ({
    invalidate: (input?: unknown) =>
      queryClient.invalidateQueries({ queryKey: input === undefined ? key : [...key, input], exact: false }),
  });

  return {
    auth: {
      me: {
        invalidate: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'], exact: false }),
        setData: (data: unknown) => queryClient.setQueryData(['auth', 'me'], data),
      },
    },
    cases: {
      list: build(['cases']),
    },
    hearings: {
      list: build(['hearings']),
    },
    documents: {
      list: build(['documents']),
    },
    invoices: {
      list: build(['invoices']),
    },
    notifications: {
      list: build(['notifications']),
    },
    messages: {
      contacts: build(['messages', 'contacts']),
      thread: build(['messages', 'thread']),
    },
    subscriptions: {
      mine: build(['subscriptions', 'mine']),
      'my-records': build(['subscriptions', 'my-records']),
      plans: build(['subscriptions', 'plans']),
    },
    admin: {
      users: build(['admin', 'users']),
      auditLogs: build(['admin', 'audit-logs']),
      transactions: build(['admin', 'transactions']),
      subscriptions: build(['admin', 'subscriptions']),
      stats: build(['admin', 'stats']),
    },
  };
}

export const trpc = {
  useContext: buildUtils,
  useUtils: buildUtils,
  auth: {
    login: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, { email: string; password: string }, unknown>, 'mutationFn'>) =>
        useMutationBase(
          (input: { email: string; password: string }) => api.login(input.email, input.password),
          options
        ),
    },
    register: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((input: any) => api.register(input), options),
    },
    logout: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, void, unknown>, 'mutationFn'>) =>
        useMutationBase(() => api.logout(), options),
    },
    me: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['auth', 'me'], () => api.getMe(), options),
    },
  },
  admin: {
    stats: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['admin', 'stats'], () => api.getStats(), options),
    },
    users: {
      useQuery: (input?: { role?: string }, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['admin', 'users', input], () => api.getUsers(input), options),
    },
    disableUser: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number, unknown>, 'mutationFn'>) =>
        useMutationBase((id: number) => api.disableUser(id), options),
    },
    auditLogs: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['admin', 'audit-logs'], () => api.getAuditLogs(), options),
    },
    transactions: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['admin', 'transactions'], () => api.getTransactions(), options),
    },
    subscriptions: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['admin', 'subscriptions'], () => api.getSubscriptions(), options),
    },
  },
  cases: {
    list: {
      useQuery: (input?: { status?: string }, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['cases', input], () => api.getCases(input), options),
    },
    create: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: any) => api.createCase(payload), options),
    },
    update: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: any) => api.updateCase(payload.id, payload), options),
    },
  },
  hearings: {
    list: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['hearings'], () => api.getHearings(), options),
    },
    create: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: any) => api.createHearing(payload), options),
    },
    update: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: any) => api.updateHearing(payload.id, payload), options),
    },
    delete: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number | { id: number }, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: number | { id: number }) => api.deleteHearing(typeof payload === 'number' ? payload : payload.id), options),
    },
  },
  documents: {
    list: {
      useQuery: (input?: { caseId?: number }, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['documents', input], () => api.getDocuments(input), options),
    },
    upload: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: any) => api.uploadDocument(payload), options),
    },
    delete: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number | { id: number }, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: number | { id: number }) => api.deleteDocument(typeof payload === 'number' ? payload : payload.id), options),
    },
  },
  invoices: {
    list: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['invoices'], () => api.getInvoices(), options),
    },
    create: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, any, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: any) => api.createInvoice(payload), options),
    },
    cancel: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number | { id: number }, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: number | { id: number }) => api.cancelInvoice(typeof payload === 'number' ? payload : payload.id), options),
    },
    refund: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number | { id: number }, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: number | { id: number }) => api.refundInvoice(typeof payload === 'number' ? payload : payload.id), options),
    },
  },
  payments: {
    createSession: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number, unknown>, 'mutationFn'>) =>
        useMutationBase((invoiceId: number) => api.createPaymentSession(invoiceId), options),
    },
  },
  notifications: {
    list: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['notifications'], () => api.getNotifications(), options),
    },
    markRead: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number, unknown>, 'mutationFn'>) =>
        useMutationBase((id: number) => api.markNotificationRead(id), options),
    },
    delete: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number, unknown>, 'mutationFn'>) =>
        useMutationBase((id: number) => api.deleteNotification(id), options),
    },
  },
  messages: {
    contacts: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['messages', 'contacts'], () => api.getMessageContacts(), options),
    },
    thread: {
      useQuery: (input: { peerId: number }, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['messages', input.peerId], () => api.getMessageThread(input.peerId), options),
    },
    send: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, { recipientId: number; body: string }, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: { recipientId: number; body: string }) => api.sendMessage(payload.recipientId, payload.body), options),
    },
  },
  subscriptions: {
    plans: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['subscriptions', 'plans'], () => api.getSubscriptionPlans(), options),
    },
    mine: {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['subscriptions', 'mine'], () => api.getMySubscription(), options),
    },
    'my-records': {
      useQuery: (_input?: undefined, options?: UseQueryOptions<unknown, Error, unknown, QueryKey>) =>
        useQueryBase(['subscriptions', 'my-records'], () => api.getMySubscriptionRecords(), options),
    },
    upgrade: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, string, unknown>, 'mutationFn'>) =>
        useMutationBase((plan: string) => api.upgradeSubscription(plan), options),
    },
    cancel: {
      useMutation: (options?: Omit<UseMutationOptions<unknown, Error, number | { id: number }, unknown>, 'mutationFn'>) =>
        useMutationBase((payload: number | { id: number }) => api.cancelSubscription(typeof payload === 'number' ? payload : payload.id), options),
    },
  },
};
