export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((token) => token.length > 0)
    .join(' ');
}
