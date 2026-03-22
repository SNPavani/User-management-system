export function getAuthHeaders() {
  return {
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    'bypass-tunnel-reminder': 'true',
  };
}

export function clearSession() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

export function generatePassword() {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghijkmnopqrstuvwxyz';
  const digits  = '0123456789';
  const special = '!@#$%&*?';
  const all     = upper + lower + digits + special;
  const pick    = (pool) => pool[Math.floor(Math.random() * pool.length)];
  const base    = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (base.length < 10) base.push(pick(all));
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join('');
}

export function validatePassword(pw) {
  if (!pw)                                 return 'Password is required';
  if (pw.length < 8)                       return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))                   return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(pw))                   return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(pw))                   return 'Include at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return 'Include at least one special character';
  return null;
}

export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email) ? null : 'Enter a valid email address';
}

export function validatePhone(phone) {
  if (!phone) return null;
  return /^\d{10}$/.test(phone) ? null : 'Phone must be exactly 10 digits';
}