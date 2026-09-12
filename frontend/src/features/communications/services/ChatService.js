import api from '../../../services/apiClient';

const BASE_URL = '/chat';

export const chatService = {
  /**
   * Retrieve active conversation threads.
   * If called with client credentials, returns their account thread.
   * If called with HR credentials, returns all active client threads.
   */
  getThreads: async (params = {}) => {
    const res = await api.get(`${BASE_URL}/threads`, { params });
    return res.data;
  },

  /**
   * Fetch chronological messages for a specific thread and mark incoming as read.
   */
  getMessages: async (threadId) => {
    const res = await api.get(`${BASE_URL}/threads/${threadId}/messages`);
    return res.data;
  },

  /**
   * Transmit a message payload to a thread.
   */
  sendMessage: async (threadId, message) => {
    const res = await api.post(`${BASE_URL}/threads/${threadId}/messages`, { message });
    return res.data;
  },

  /**
   * Mark all messages in a thread as read for the active viewer.
   */
  markAsRead: async (threadId) => {
    const res = await api.patch(`${BASE_URL}/threads/${threadId}/read`);
    return res.data;
  },

  /**
   * Fast poll to fetch current unread message count for topbar badges.
   */
  getUnreadCount: async () => {
    const res = await api.get(`${BASE_URL}/unread-count`);
    return res.data;
  },

  /**
   * Open or initialize a thread with a client by their account ID.
   */
  findOrCreateForClient: async (clientId) => {
    const res = await api.post(`${BASE_URL}/threads/by-client/${clientId}`);
    return res.data;
  },
};
