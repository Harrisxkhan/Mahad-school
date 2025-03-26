// Activation API Module

// Valid activation codes
const validCodes = [
  'SCHOOL2023',
  'EDUHELPER',
  'HOMEWORKAPP'
];

/**
 * Verify if the provided activation code is valid
 * @param {string} code - The activation code to verify
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export function verifyActivationCode(code) {
  // Convert to uppercase for case-insensitive comparison
  const normalizedCode = code.trim().toUpperCase();
  return validCodes.includes(normalizedCode);
}

/**
 * Generate an activation token
 * @returns {string} - A unique activation token
 */
export function generateActivationToken() {
  // Generate a random token (in a real app, this would be more secure)
  return 'HW_HELPER_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 