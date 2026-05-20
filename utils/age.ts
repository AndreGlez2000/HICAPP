/**
 * Calculates the age in full years from a DOB string (ISO 8601 'YYYY-MM-DD').
 * Returns 0 for empty or invalid input.
 */
export function calculateAge(dob: string): number {
  if (!dob || dob.trim() === '') return 0;

  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  // Haven't hit birthday yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return Math.max(0, age);
}
