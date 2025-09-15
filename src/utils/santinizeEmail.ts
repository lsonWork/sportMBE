export function sanitizeEmail(email: string): string {
  return email
    .normalize('NFC')
    .replace(/\u200B/g, '')
    .trim()
    .toLowerCase();
}
