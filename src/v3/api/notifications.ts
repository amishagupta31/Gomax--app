// C4-02 Notifications. GET /notifications · POST /notifications/read.
import { api, read } from './client';

export type NoteKind = 'money' | 'gifts' | 'games' | 'invite';
export type ServerNote = {
  id: string;
  kind: NoteKind;
  title: string;
  body: string | null;
  art: string | null;
  link: { route: string; params?: Record<string, unknown> } | null;
  read: boolean;
  at: string;
};

export const listNotifications = () =>
  read(async () => (await api<{ rows: ServerNote[] }>('/notifications', { query: { limit: 100 } })).rows, [] as ServerNote[]);

export const markRead = (id: string) => read(() => api('/notifications/read', { method: 'POST', body: { ids: [id] } }), null);
