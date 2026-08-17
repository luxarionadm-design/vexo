/**
 * Validation utilities
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
    return password && password.length >= 6;
}

export function isFormValid(email, password) {
    return isValidEmail(email) && isValidPassword(password);
}
