import { uniquelize } from '../utils/array';

function findClosingParenthesisIndex(str: string, startPos: number) {
  const stack = [];
  const openingBracket = str[startPos];
  const closingBracket = openingBracket === '(' ? ')' : ']';

  for (let i = startPos; i < str.length; i++) {
    const char = str[i];

    if (openingBracket === char) {
      stack.push(char); // Push the opening bracket onto the stack
    } else if (stack.length > 0 && char === closingBracket) {
      stack.pop(); // Pop the stack when a matching closing bracket is found
      if (stack.length === 0) {
        return i; // Return the index when all opening brackets are matched
      }
    }
  }

  return -1; // Return -1 if no matching closing parenthesis is found
}

const punctuation = new Set(['.', ',', ';', ':', '!', '?', '"']);

const joinSpaced = (a: string, b: string) => {
  const lastLetter = a[a.length - 1];
  const firstLetter = b[0];
  if (lastLetter === ' ' && firstLetter === ' ') {
    return a + b.substring(1);
  }
  return a + b;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function generatePossibleAnswersHelper(str: string): string[] {
  const possibleAnswers: string[] = [];
  // debugger;
  let start = '';
  let lastParenthesis = -1;
  for (let i = 0; i < str.length; i++) {
    start += str[i];
    if (str[i] === '(' || str[i] === '[') {
      let closingIndex = findClosingParenthesisIndex(str, i);
      if (closingIndex === -1) closingIndex = str.length;
      lastParenthesis = Math.max(lastParenthesis, closingIndex);
      const firstPart = str.slice(0, i);
      const secondPart = str.slice(closingIndex + 1);
      // const newAnswer = joinSpaced(firstPart, secondPart);
      // TODO: take care of 2 spaces
      // newAnswer.length > 0 && possibleAnswers.push(newAnswer);
      if (i > 0 || closingIndex < str.length - 1) {
        for (const s of generatePossibleAnswersHelper(str.slice(i, closingIndex + 1))) {
          possibleAnswers.push(joinSpaced(joinSpaced(firstPart, s), secondPart));
        }
        if (closingIndex < str.length - 1) {
          for (const s of generatePossibleAnswersHelper(str.slice(closingIndex + 1))) {
            possibleAnswers.push(joinSpaced(firstPart, s));
          }
        } else {
          possibleAnswers.push(firstPart);
        }
      } else {
        const rest = generatePossibleAnswersHelper(str.slice(i + 1, closingIndex));
        possibleAnswers.push(...rest);
        const startC = str[0];
        const endC = str.slice(closingIndex);
        for (const s of rest) {
          possibleAnswers.push(joinSpaced(joinSpaced(startC, s.trim()), endC));
        }
        return possibleAnswers;
      }
      i = closingIndex;
      start = str.slice(0, closingIndex);
    } else if (str[i] === '.' || str[i] === ',' || str[i] === '/') {
      // stop symbols
      const firstPart = str.slice(0, i);
      // const secondPart = str.slice(i + 1);
      possibleAnswers.push(firstPart);
      possibleAnswers.push(start);
      const rest = i === str.length - 1 ? [] : generatePossibleAnswersHelper(str.substring(i + 1));
      possibleAnswers.push(...rest);
      for (const s of rest) {
        possibleAnswers.push(joinSpaced(firstPart, s));
      }
      for (const s of rest) {
        possibleAnswers.push(joinSpaced(start, s));
      }
      break;
    } else if (punctuation.has(str[i])) {
      const firstPart = str.slice(0, i);
      for (const s of generatePossibleAnswersHelper(str.substring(i + 1))) {
        possibleAnswers.push(joinSpaced(firstPart, s));
      }
    }
  }
  possibleAnswers.push(str);
  if (possibleAnswers.length > 1) {
    return uniquelize(possibleAnswers);
  }
  return possibleAnswers;
}

export const generatePossibleAnswers = (str: string, caseInsensitive: boolean, lang: string): string[] => {
  const strs = str.trim().split(/[;\n]/);
  const array: string[] = [];
  for (const s of strs) {
    const arr = generatePossibleAnswersHelper(s.trim());
    const extendedAnswers = extendArray(arr, lang);
    for (const el of extendedAnswers) {
      if (!el) continue;
      const trimmed = el.trim();
      if (!trimmed) continue;
      if (caseInsensitive) {
        array.push(trimmed.toLowerCase());
      } else array.push(trimmed);
    }
  }
  return array;
};
(window as never as Record<string, unknown>).generatePossibleAnswers = generatePossibleAnswers;

const extendArray = (array: string[], lang: string): string[] => {
  if (lang === 'en') return array.map(extendEnglishAnswers).flat();
  return array;
};

const extendEnglishAnswers = (str: string): string | string[] => {
  if (str.startsWith('to ') || str.startsWith('To ')) {
    return [str, str.slice(3)];
  }
  if (str.startsWith('a ') || str.startsWith('A ')) {
    return [str, str.slice(2)];
  }
  if (str.startsWith('an ') || str.startsWith('An ')) {
    return [str, str.slice(3)];
  }
  if (str.startsWith('the ') || str.startsWith('The ')) {
    return [str, str.slice(4)];
  }
  return str;
};
