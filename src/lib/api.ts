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

const API_BASE_URL = 'https://asal-backend-2.onrender.com/api';
