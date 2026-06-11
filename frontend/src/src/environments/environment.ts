const apiUrl = 'http://localhost:8080/api';

export const environment = {
  production: false,
  apiUrl,

  LOGIN_REQUEST: 'http://localhost:8080/auth/login',
  SUBMIT_REQUEST: `${apiUrl}/add`,
  // GET_ALL_REQUESTS: `${apiUrl}/all`,
  // APPROVE_REQUEST: `${apiUrl}/approve`,
  // REJECT_REQUEST: `${apiUrl}/reject`
};