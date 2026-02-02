export function generateId(): string {
  // return randomUUID();
  return 'id-' + Math.random().toString(36).substring(2, 9);
}
