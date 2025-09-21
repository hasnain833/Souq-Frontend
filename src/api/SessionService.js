import apiService from './ApiService';

// Get login activity (no credentials needed)
export const getSessionData = () =>
  apiService({
    url: '/api/user/sessions/login-activity',
    method: 'GET',
    // withAuth: true,
  });

export const logoutSession = (sessionId) =>
  apiService({
    url: '/api/user/sessions/logout-session', 
    method: 'POST',
    data: { sessionId },
    withAuth: true,
  });
