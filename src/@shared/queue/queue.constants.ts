export const QUEUE_NAMES = {
  EMAIL: 'email',
  STORAGE: 'storage',
  AUDIT: 'audit',
  NOTIFICATION: 'notification',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
