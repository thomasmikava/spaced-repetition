/* eslint-disable sonarjs/cognitive-complexity */

// Takes a string and outputs an array of strings, splitting on slashes.
// Supports parentheses for variants.
// Examples:
// "I/you gonna go to bar/café" -> ["I gonna go to bar", "I gonna go to café", "you gonna go to bar", "you gonna go to café"]
// "er/sie/es ist geworden/worden" -> ["er ist geworden", "er ist worden", "sie ist geworden", "sie ist worden", "es ist geworden", "es ist worden"]
// "(You and I)/We are/(will be) fine" -> ["You and I are fine", "You and I will be fine", "We are fine", "We will be fine"]
export function slashSplit(input: string): string[] {
  // Initial processing of the input
  const segments = processSegment(input);
  // Generate and return all combinations
  return combine(segments);
}

// Recursive function to process each segment and generate combinations
function processSegment(segment: string): string[][] {
  // Base case: if the segment is simple (no slashes), return it directly
  if (!segment.includes('/')) {
    return [[segment]];
  }

  const parts: string[][] = [];
  let lastVariants: string[] | undefined = undefined;
  let buffer = '';
  let parenthesisDepth = 0;
  let start = 0; // Tracks the start of a substring

  const text = segment + ' ';
  for (let i = 0; i < text.length; i++) {
    // debugger;
    const char = text[i];

    // Handle nested parentheses
    if (char === '(') {
      if (parenthesisDepth === 0) {
        start = i + 1;
        if (!lastVariants) {
          parts.push([buffer]);
          buffer = '';
        }
      }
      parenthesisDepth++;
    } else if (char === ')') {
      parenthesisDepth--;
      if (parenthesisDepth === 0) {
        // Process the content within the parentheses recursively
        buffer = text.substring(start, i);
        const variantsInParenthesis = combine(processSegment(buffer));
        if (lastVariants) {
          lastVariants.push(...variantsInParenthesis);
        } else {
          lastVariants = variantsInParenthesis;
        }
        buffer = '';
      }
      continue;
    } else if (char === '/' && parenthesisDepth === 0) {
      if (buffer) {
        if (lastVariants) {
          lastVariants.push(buffer);
        } else {
          if (buffer.includes(' ')) {
            const spaceIndex = buffer.lastIndexOf(' ');
            parts.push([buffer.substring(0, spaceIndex + 1)]);
            buffer = buffer.substring(spaceIndex + 1);
          }
          lastVariants = [buffer];
        }
        buffer = '';
        continue;
      }
    } else if (parenthesisDepth === 0 && char === ' ') {
      if (lastVariants) {
        buffer && lastVariants.push(buffer);
        parts.push(lastVariants);
        lastVariants = undefined;
        buffer = '';
      } else if (i === text.length - 1) {
        parts.push([buffer]);
      }
      buffer += char;
    } else if (parenthesisDepth === 0) {
      buffer += char;
    }
  }

  return parts;
}

// Flatten and combine all parts to generate final strings
function combine(parts: string[][]): string[] {
  if (parts.length === 0) return [];
  if (parts.length === 1) return parts[0];

  const [first, ...rest] = parts;
  const combinations = combine(rest);

  if (combinations.length === 0) return first;
  const results: string[] = [];

  first.forEach((part) => {
    combinations.forEach((combination) => {
      results.push(part + combination);
    });
  });

  return results;
}
/* 
// Examples to test
const examples = [
  'I/you gonna go to bar/café',
  'er/sie/es ist geworden/worden',
  'a/b thu op/(ui p) ju',
  'a/b thu (You and I)/We are/(will be) fine',
  'heyy, (you (and/or) I)/we are cool',
];

console.log(processSegment(examples[3]));

examples.forEach((example) => {
  console.log(`Input: "${example}"`);
  console.log('Output:', combine(processSegment(example)));
});
 */
