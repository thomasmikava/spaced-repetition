import { normalize, getPrefixMatch, computeModifiedDistance, reconstructOneChange, getMinimalChange } from './hint';

describe('normalize', () => {
  test('converts to lowercase if caseInsensitive is true', () => {
    expect(normalize('Hello', true)).toBe('hello');
  });

  test('does not convert to lowercase if caseInsensitive is false', () => {
    expect(normalize('Hello', false)).toBe('Hello');
  });
});

describe('getPrefixMatch', () => {
  test('returns matched prefix when found', () => {
    const prefixes = ['a ', 'an ', 'the '];
    expect(getPrefixMatch('the apple', prefixes, true)).toBe('the ');
    expect(getPrefixMatch('An apple', prefixes, true)).toBe('an ');
  });

  test('returns undefined when no prefix matches', () => {
    const prefixes = ['a ', 'an '];
    expect(getPrefixMatch('the apple', prefixes, true)).toBeUndefined();
  });

  test('handles case insensitivity', () => {
    const prefixes = ['An ', 'The '];
    expect(getPrefixMatch('an apple', prefixes, true)).toBe('An ');
  });
});

describe('computeModifiedDistance', () => {
  const prefixes = ['a ', 'an ', 'the '];

  test('no prefixes involved, case sensitive', () => {
    expect(computeModifiedDistance('apple', 'aple', [], false)).toBe(1); // one insertion/deletion difference
  });

  test('case insensitive comparison', () => {
    expect(computeModifiedDistance('Apple', 'apple', [], true)).toBe(0);
    expect(computeModifiedDistance('APPLE', 'apple', [], true)).toBe(0);
  });

  test('prefix missing in input', () => {
    // "the apple" vs "apple", missing 'the ' should count as 1 difference
    expect(computeModifiedDistance('apple', 'the apple', prefixes, true)).toBe(1);
  });

  test('prefix present in input', () => {
    // Both have 'the '
    expect(computeModifiedDistance('the apple', 'the apple', prefixes, true)).toBe(0);
  });

  test('simple substitutions with prefix', () => {
    // userInput: "the aple", correct: "an apple"
    // Missing prefix 'an ' vs 'the ' = 1 (prefix difference)
    // then 'aple' vs 'apple' = 1 more substitution
    // total could be 2, but we want to confirm logic:
    const dist = computeModifiedDistance('the aple', 'an apple', prefixes, true);
    // Here’s the logic:
    // "an " vs "the ": prefix replaced counts as 1
    // "apple" vs "aple": Levenshtein = 1 insertion
    // total = 1 (prefix) + 1 = 2
    expect(dist).toBe(2);
  });
});

describe('reconstructOneChange', () => {
  const prefixes = ['a ', 'an ', 'the '];

  test('no changes needed', () => {
    expect(reconstructOneChange('apple', 'apple', [], true)).toBe('apple');
  });

  test('one prefix fix', () => {
    // From the example: user: "apple" correct: "the apple"
    // One change to add 'the '
    expect(reconstructOneChange('apple', 'the apple', prefixes, true)).toBe('the apple');
  });

  test('one character fix after prefix', () => {
    // From previous example: user: "the aple", best: "an apple"
    // Fix prefix 'the ' to 'an ' and then proceed until another mismatch
    // "the aple" vs "an apple":
    // Change prefix => "an " and then match "ap"
    // Next mismatch after "ap" would stop.
    // Expected: "an ap"
    expect(reconstructOneChange('the aple', 'an apple', prefixes, true)).toBe('an ap');
  });

  test('fix one character in the middle of the word', () => {
    // user: "spigeb", correct: "spiegel"
    // One insertion 'e' after 'spig' => "spige"
    // Then next char mismatch would stop
    expect(reconstructOneChange('spigeb', 'spiegel', [], true)).toBe('spiege');
  });

  test('user input shorter than correct value, no initial change needed', () => {
    // user: "ap", correct: "apple"
    // Both "ap" match start of "apple"
    // We can insert one character to get "app"
    expect(reconstructOneChange('ap', 'apple', prefixes, true)).toBe('app');
  });

  test('user input is empty, correct value "apple"', () => {
    // user: "", correct: "apple"
    // No initial matching chars, we can insert one character: "a"
    expect(reconstructOneChange('', 'apple', prefixes, true)).toBe('a');
  });

  test('c1', () => {
    expect(reconstructOneChange('den ', 'den Jahren', [], true)).toBe('den J');
  });

  test('c2', () => {
    expect(reconstructOneChange('', 'das Jahr', ['der ', 'die ', 'das '], true)).toBe('das ');
  });
});

describe('getMinimalChange', () => {
  const prefixes = ['a ', 'an ', 'the '];

  test('no correct values', () => {
    expect(getMinimalChange('apple', [], true, prefixes)).toBe('apple');
  });

  test('exact match', () => {
    expect(getMinimalChange('apple', ['apple', 'banana'], true, prefixes)).toBe('apple');
  });

  test('simple closest match', () => {
    expect(getMinimalChange('aple', ['apple', 'applet'], true, [])).toBe('apple');
  });

  test('prefix scenario', () => {
    const result = getMinimalChange('the aple', ['an apple'], true, prefixes);
    // From the examples, should be "an ap"
    expect(result).toBe('an ap');
  });

  test('multiple candidates, choose minimal distance', () => {
    // "the aple" vs ["an apple", "apple", "the appl"]
    // distances:
    // "an apple": 2 (prefix + 1 char)
    // "apple": missing prefix "the " replaced by nothing = removal of 'the '? Actually "the" isn't a given prefix here,
    // but let's assume we only have given prefixes. If no prefix is recognized, it's a normal distance measure.
    // "the appe": difference from "the aple" is 1 char at end.
    // The minimal would be "the appe"
    expect(getMinimalChange('the aple', ['an apple', 'the appe', 'apple'], true, prefixes)).toBe('the appe');
  });
});
