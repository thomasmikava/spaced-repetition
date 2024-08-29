import { generatePossibleAnswers } from './compare-answers';

const comparePartialAnswer = (fullAnswer: string, userInput: string): boolean => {
  const possibleAnswers = generatePossibleAnswers(fullAnswer, true);

  return possibleAnswers.includes(userInput);
};

describe('compareAnswers', () => {
  it.each([
    ['to snore. ხვრინვა', 'to snore', true],
    ['to snore. ხვრინვა', 'ხვრინვა', true],
    ['to snore. პირით ხვრინვა', 'პირით ხვრინვა', true],
    ['to snore. ხვრინვა', 'to snore. ხვრინვა', true],
    ['cry, weep', 'cry', true],
    ['cry, weep', 'weep', true],
    ['to cry, weep', 'weep', true],
    ['cry, weep', 'cryweep', false],
  ])('should handle partial answers %s %s %p', (correctAnswer, userInput, result) => {
    expect(comparePartialAnswer(correctAnswer, userInput)).toBe(result);
  });

  it.each([
    ['to snore. ხვრინვა', 'to snore ხვრინვა', true],
    ['cry, weep.', 'cry, weep', true],
    ['cry, weep', 'cry weep', true],
    ['to deal "success"', 'to deal "success"', true],
    ['to deal "success"', 'to deal success', true],
    ['to deal', 'to deal', true],
  ])('should return true if basic symbols are omitted %s %s %p', (correctAnswer, userInput, result) => {
    expect(comparePartialAnswer(correctAnswer, userInput)).toBe(result);
  });

  it.each([
    ['to cry (tears, from eyes)', 'to cry', true],
    ['to cry (tears, from eyes)', 'to cry tears', true],
    ['to cry (tears, from eyes)', 'to cry tears from eyes', true],
    ['to cry (tears, from eyes)', 'to cry (tears)', true],
    ['to cry (tears from eyes)', 'to cry (tears)', false],
    ['to cry (tears (from eyes))', 'to cry (tears)', true],
    ['to cry (tears [from eyes])', 'to cry (tears)', true],
    ['to cry (tears, from eyes)', 'to cry tears from eyes', true],
    ['to cry [tears, from eyes]', 'to cry', true],
    ['to cry [tears, from eyes]', 'to cry tears', true],
    ['to cry [tears, from eyes]', 'to cry tears from eyes', true],
    ['to cry [tears, from eyes]', 'to cry [tears]', true],
    ['to cry [tears from eyes]', 'to cry [tears]', false],
    ['to cry [tears [from eyes]]', 'to cry [tears]', true],
    ['to cry [tears (from eyes)]', 'to cry [tears]', true],
    ['to cry [tears, from eyes]', 'to cry tears from eyes', true],
  ])('should be able to skip words in parenthesis %s %s %p', (correctAnswer, userInput, result) => {
    expect(comparePartialAnswer(correctAnswer, userInput)).toBe(result);
  });

  it.each([['to cry', 'to', false]])(
    'should be able to skip words in parenthesis',
    (correctAnswer, userInput, result) => {
      expect(comparePartialAnswer(correctAnswer, userInput)).toBe(result);
    },
  );
});
