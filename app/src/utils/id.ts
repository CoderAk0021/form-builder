export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateShortId(): string {
  return Math.random().toString(36).substr(2, 9);
}
