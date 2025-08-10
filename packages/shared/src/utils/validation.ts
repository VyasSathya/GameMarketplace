import { VALIDATION_RULES } from '../constants';

/**
 * Validate username
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters` };
  }
  
  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    return { valid: false, error: `Username must be no more than ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters` };
  }
  
  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { valid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  const rules = VALIDATION_RULES.PASSWORD;
  
  if (password.length < rules.MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${rules.MIN_LENGTH} characters` };
  }
  
  if (password.length > rules.MAX_LENGTH) {
    return { valid: false, error: `Password must be no more than ${rules.MAX_LENGTH} characters` };
  }
  
  if (rules.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (rules.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (rules.REQUIRE_NUMBER && !/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  if (rules.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
}

/**
 * Validate Bitcoin address (basic check)
 */
export function validateBitcoinAddress(address: string): { valid: boolean; error?: string } {
  // Basic Bitcoin address validation (simplified)
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  
  if (!btcRegex.test(address)) {
    return { valid: false, error: 'Please enter a valid Bitcoin address' };
  }
  
  return { valid: true };
}
