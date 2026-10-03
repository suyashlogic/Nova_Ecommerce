// Quick client-side checks so users get instant feedback.
// The server repeats every rule: client validation is for convenience, never security.
export function validateEmail(value) {
  if (!value.trim()) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(value.trim())) return 'Enter a valid email';
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8 || value.length > 72) return 'Password must be 8 to 72 characters';
  if (!/[A-Za-z]/.test(value)) return 'Password must contain a letter';
  if (!/\d/.test(value)) return 'Password must contain a number';
  return '';
}

export function validateName(value) {
  const length = value.trim().length;
  if (length < 2 || length > 100) return 'Name must be 2 to 100 characters';
  return '';
}

// True when an errors object has at least one message
export const hasErrors = (errors) => Object.values(errors).some(Boolean);
