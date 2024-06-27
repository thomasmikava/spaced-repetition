/* eslint-disable sonarjs/cognitive-complexity */

import { isNonNullable } from './array';

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

export function areSplittedEqual(v1: string | null | undefined, v2: string | null | undefined): boolean {
  if (!v1 || !v2 || !v1.includes('/') || !v2.includes('/')) return v1 === v2;
  const s1 = slashSplit(v1);
  const s2 = slashSplit(v2);
  return s1.join('^') === s2.join('^');
}

export function mergeSplitted(splitted: (string | null | undefined)[], optimized = false): string {
  const stringValues = splitted.filter(isNonNullable);
  if (stringValues.length <= 1) return stringValues.join('/');
  if (!optimized) return stringValues.map((e) => (e.match(/\s/) ? `(${e})` : e)).join('/');
  return combineWords(stringValues);
}

function generateCombinations(limits: number[]): number[][] {
  const results: number[][] = [];

  function backtrack(current: number[], index: number) {
    if (index === limits.length) {
      results.push([...current]);
      return;
    }

    for (let i = 0; i < limits[index]; i++) {
      current.push(i);
      backtrack(current, index + 1);
      current.pop();
    }
  }

  backtrack([], 0);
  return results;
}

export function combineWords(arr: string[]): string {
  if (arr.length === 0) return '';

  const allSentences = new Set(arr);
  const sentences = arr.map((sentence) => sentence.split(' '));

  const combinations = generateCombinations(sentences.map((sentence) => sentence.length + 1));

  let optimalString = null as string | null;
  for (const combination of combinations) {
    const prefixes: string[] = [];
    const suffixes: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      const index = combination[i];
      const currentSentence = sentences[i];
      prefixes.push(currentSentence.slice(0, index).join(' '));
      suffixes.push(currentSentence.slice(index).join(' '));
    }
    let couldIdBePrefix = true;
    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const newWord1 = prefixes[i] + ' ' + suffixes[j];
        const newWord2 = prefixes[j] + ' ' + suffixes[i];
        if (!allSentences.has(newWord1) || !allSentences.has(newWord2)) {
          couldIdBePrefix = false;
          break;
        }
      }
      if (couldIdBePrefix) break;
    }
    if (!couldIdBePrefix) continue;
    const match = combinePrefixes(prefixes) + ' ' + combineWords(suffixes);
    if (optimalString === null || optimalString.length > match.length) {
      optimalString = match;
    }
  }

  if (optimalString === null) {
    return combinePrefixes(arr);
  }

  return optimalString;
}

const combinePrefixes = (arr: string[]): string => {
  if (arr.length === 0) return '';
  return [...new Set(arr)].map((sentence) => (sentence.includes(' ') ? `(${sentence})` : sentence)).join('/');
};
/* 
// Example usage:
const example1 = ['I gonna go to bar', 'I gonna go to café', 'you gonna go to bar', 'you gonna go to café'];
const example2 = [
  'er ist geworden',
  'er ist worden',
  'sie ist geworden',
  'sie ist worden',
  'es ist geworden',
  'es ist worden',
];
const example3 = ['You and I are fine', 'You and I will be fine', 'We are fine', 'We will be fine'];

console.log(combineWords(example1)); // Output: "I/you gonna go to bar/café"
console.log(combineWords(example2)); // Output: "er/sie/es ist geworden/worden"
console.log(combineWords(example3)); // Output: "(You and I)/We are/(will be) fine"
 */
