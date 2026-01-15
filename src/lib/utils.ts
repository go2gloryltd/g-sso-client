// src/lib/utils.ts - Inline implementation (no external dependencies)

export type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Simple className merger (replaces clsx + tailwind-merge)
 * Joins class names and removes duplicates
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    }
  }
  
  // Remove duplicates and join
  return Array.from(new Set(classes.join(' ').split(' ')))
    .filter(Boolean)
    .join(' ');
}