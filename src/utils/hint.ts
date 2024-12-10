/* eslint-disable sonarjs/cognitive-complexity */
export function normalize(str: string, caseInsensitive: boolean) {
  return caseInsensitive ? str.toLowerCase() : str;
}

export function getPrefixMatch(val: string, prefixes: string[], caseInsensitive: boolean): string | undefined {
  const normVal = normalize(val, caseInsensitive);
  for (const prefix of prefixes) {
    const normPrefix = normalize(prefix, caseInsensitive);
    if (normVal.startsWith(normPrefix)) return prefix;
  }
  return undefined;
}

export function computeModifiedDistance(
  input: string,
  target: string,
  prefixes: string[],
  caseInsensitive: boolean,
): number {
  const normInput = caseInsensitive ? input.toLowerCase() : input;
  const normTarget = caseInsensitive ? target.toLowerCase() : target;

  const getPrefixMatch = (val: string, prefixArr: string[]): string | undefined => {
    const checkVal = caseInsensitive ? val.toLowerCase() : val;
    for (const prefix of prefixArr) {
      const checkPrefix = caseInsensitive ? prefix.toLowerCase() : prefix;
      if (checkVal.startsWith(checkPrefix)) return prefix;
    }
    return undefined;
  };

  const userPrefix = getPrefixMatch(input, prefixes);
  const targetPrefix = getPrefixMatch(target, prefixes);

  let prefixCost = 0;
  let inputStr = normInput;
  let targetStr = normTarget;

  // Handle prefix scenarios:
  if (userPrefix && targetPrefix) {
    // Both have recognized prefixes
    const normUserPrefix = caseInsensitive ? userPrefix.toLowerCase() : userPrefix;
    const normTargetPrefix = caseInsensitive ? targetPrefix.toLowerCase() : targetPrefix;
    if (normUserPrefix === normTargetPrefix) {
      // Same prefix, remove from both, no extra cost
      inputStr = inputStr.slice(normUserPrefix.length);
      targetStr = targetStr.slice(normTargetPrefix.length);
    } else {
      // Different recognized prefixes => cost is 1
      prefixCost = 1;
      inputStr = inputStr.slice(normUserPrefix.length);
      targetStr = targetStr.slice(normTargetPrefix.length);
    }
  } else if (targetPrefix && !userPrefix) {
    // Target has a prefix, user does not => cost 1
    const normTargetPrefix = caseInsensitive ? targetPrefix.toLowerCase() : targetPrefix;
    prefixCost = 1;
    targetStr = targetStr.slice(normTargetPrefix.length);
  } else if (userPrefix && !targetPrefix) {
    // User has a prefix, target does not => cost 1
    const normUserPrefix = caseInsensitive ? userPrefix.toLowerCase() : userPrefix;
    prefixCost = 1;
    inputStr = inputStr.slice(normUserPrefix.length);
  }

  // Standard Levenshtein distance on remainder
  const m = inputStr.length;
  const n = targetStr.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = inputStr[i - 1] === targetStr[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return dp[m][n] + prefixCost;
}

export function reconstructOneChange(
  userInput: string,
  bestValue: string,
  prefixes: string[],
  caseInsensitive: boolean,
): string {
  const normalize = (str: string) => (caseInsensitive ? str.toLowerCase() : str);
  const getPrefixMatch = (val: string, prefixArr: string[]): string | undefined => {
    const normVal = normalize(val);
    for (const prefix of prefixArr) {
      if (normVal.startsWith(normalize(prefix))) return prefix;
    }
    return undefined;
  };

  const normUser = normalize(userInput);
  const normBest = normalize(bestValue);

  let result = '';
  let userPos = 0;
  let bestPos = 0;
  let changes = 0;

  // Handle prefix scenario
  const userPrefix = getPrefixMatch(userInput, prefixes);
  const bestPrefix = getPrefixMatch(bestValue, prefixes);

  if (userPrefix && bestPrefix) {
    const nu = normalize(userPrefix);
    const nb = normalize(bestPrefix);
    if (nu === nb) {
      // Same prefix, copy it and move forward
      result += bestValue.slice(0, bestPrefix.length);
      userPos += userPrefix.length;
      bestPos += bestPrefix.length;
    } else {
      // Different prefixes, one change here
      result += bestValue.slice(0, bestPrefix.length);
      userPos += userPrefix.length;
      bestPos += bestPrefix.length;
      changes = 1;
    }
  } else if (bestPrefix && !userPrefix) {
    // Missing prefix in user
    result += bestValue.slice(0, bestPrefix.length);
    bestPos += bestPrefix.length;
    changes = 1; // used up our one change
  } else if (userPrefix && !bestPrefix) {
    // Extra prefix in user
    userPos += userPrefix.length;
    changes = 1;
  }

  // Now go char by char
  while (bestPos < bestValue.length && userPos < userInput.length) {
    const userChar = normUser[userPos];
    const bestChar = normBest[bestPos];

    if (userChar === bestChar) {
      // match
      result += bestValue[bestPos];
      userPos++;
      bestPos++;
    } else {
      // mismatch
      if (changes === 0) {
        // Attempt insertion
        if (bestPos + 1 < bestValue.length && normUser[userPos] === normBest[bestPos + 1]) {
          // Insert bestValue[bestPos]
          result += bestValue[bestPos];
          bestPos++;
          changes = 1;
        }
        // Attempt deletion
        else if (userPos + 1 < userInput.length && normBest[bestPos] === normUser[userPos + 1]) {
          // Align by skipping one user char
          result += bestValue[bestPos];
          userPos += 2;
          bestPos++;
          changes = 1;
        } else {
          // Substitution
          result += bestValue[bestPos];
          userPos++;
          bestPos++;
          changes = 1;
        }
      } else {
        // Already changed once, stop
        break;
      }
    }
  }

  // If we've reached the end of userInput but still can make one change (and no second mismatch encountered):
  // We can insert one character from bestValue if available.
  if (changes === 0 && userPos === userInput.length && bestPos < bestValue.length) {
    // Insert one character from bestValue as our one allowed change
    result += bestValue[bestPos];
    bestPos++;
    changes = 1;

    // After this insertion, we do not add more chars because that would be another change
  }

  // If we still haven't encountered a second mismatch and both pointers can move,
  // we can continue while they match (though the problem states we stop after a second mismatch)
  while (changes < 2 && bestPos < bestValue.length && userPos < userInput.length) {
    const userChar = normUser[userPos];
    const bestChar = normBest[bestPos];
    if (userChar === bestChar) {
      result += bestValue[bestPos];
      userPos++;
      bestPos++;
    } else {
      break;
    }
  }

  return result;
}

export function getMinimalChange(
  userInput: string,
  correctValues: string[],
  caseInsensitive: boolean,
  prefixes: string[] = [],
): string {
  if (correctValues.length === 0) return userInput;

  const normalizedUserValue = normalize(userInput, caseInsensitive);
  const startedOnes = correctValues.filter((val) =>
    caseInsensitive ? val.toLowerCase().startsWith(normalizedUserValue) : val.startsWith(normalizedUserValue),
  );
  const availableOnes = startedOnes.length > 0 ? startedOnes : correctValues;

  // Find best match
  let bestValue = correctValues[0];
  let minDist = Infinity;

  for (const val of availableOnes) {
    const dist = computeModifiedDistance(userInput, val, prefixes, caseInsensitive);
    if (dist < minDist) {
      minDist = dist;
      bestValue = val;
    }
  }

  return reconstructOneChange(userInput, bestValue, prefixes, caseInsensitive);
}
// window.getMinimalChange = getMinimalChange;
