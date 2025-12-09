const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

/**
 * Get notifications for the authenticated user
 * @param {string} token - Auth token
 * @param {Object} params - Query parameters
 * @param {boolean} params.unreadOnly - Get only unread notifications
 * @param {number} params.limit - Limit number of results
 * @param {number} params.offset - Offset for pagination
 */
export const getNotifications = async (token, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_URL}/api/notifications${queryParams ? `?${queryParams}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notifications');
  }

  return response.json();
};

/**
 * Get unread notification count
 * @param {string} token - Auth token
 */
export const getUnreadCount = async (token) => {
  const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch unread count');
  }

  return response.json();
};

/**
 * Mark a notification as read
 * @param {string} token - Auth token
 * @param {string} notificationId - Notification ID
 */
export const markNotificationAsRead = async (token, notificationId) => {
  const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark notification as read');
  }

  return response.json();
};

/**
 * Mark all notifications as read
 * @param {string} token - Auth token
 */
export const markAllNotificationsAsRead = async (token) => {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark all notifications as read');
  }

  return response.json();
};

/**
 * Delete a notification
 * @param {string} token - Auth token
 * @param {string} notificationId - Notification ID
 */
export const deleteNotification = async (token, notificationId) => {
  const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete notification');
  }

  return response.json();
};

/**
 * Delete all read notifications
 * @param {string} token - Auth token
 */
export const deleteReadNotifications = async (token) => {
  const response = await fetch(`${API_URL}/api/notifications/read`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete read notifications');
  }

  return response.json();
};
