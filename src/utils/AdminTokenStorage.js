export function saveAdminToken(token) {
  localStorage.setItem('admin_access', token || '');
}

export function getAdminToken() {
  return localStorage.getItem('admin_access') || '';
}

export function clearAdminToken() {
  localStorage.removeItem('admin_access');
}
