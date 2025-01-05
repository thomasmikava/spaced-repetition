export function generateHash8(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Convert to base-36 and ensure better distribution
  const base36Hash = Math.abs(hash).toString(36);
  // Add a secondary transformation for better entropy
  const combined = base36Hash + input.length.toString(36);
  return combined.padEnd(8, 'x').slice(0, 8); // Ensure it's exactly 8 characters
}
