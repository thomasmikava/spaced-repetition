import { FC, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLatestCallback } from '../utils/hooks';

interface QuestionResult {
  isCorrect: boolean;
}

type TestInfo = {
  mode: 'edit' | 'readonly';
  useOnCheck: <T extends QuestionResult>(questionId: string | undefined, check: () => T) => T | undefined;
};

const TestContext = createContext<TestInfo | null>(null);
TestContext.displayName = 'TestContextProvider';

type Props = {
  children: React.ReactNode;
  mode: TestInfo['mode'];
  onResult: (areAllCorrect: boolean) => void;
};
export const TestContextProvider: FC<Props> = ({ children, mode, onResult }) => {
  const ref = useRef<Record<string, { lastCb: () => QuestionResult; lastResult?: QuestionResult }>>({});
  const isMountedRef = useRef(false);
  const onLatestResult = useLatestCallback(onResult);

  useEffect(() => {
    if (mode !== 'readonly' || !isMountedRef.current) return;
    let areAllCorrect = true;
    for (const questionId in ref.current || {}) {
      const { lastCb } = ref.current[questionId];
      const result = lastCb();
      ref.current[questionId].lastResult = result;
      if (!result.isCorrect) areAllCorrect = false;
    }
    onLatestResult(areAllCorrect);
  }, [mode]);

  const useOnCheck = useCallback(
    <T extends QuestionResult>(questionId: string | undefined, check: () => T): T | undefined => {
      const [lastResult, setLastResult] = useState<T | undefined>(
        questionId !== undefined ? (ref.current[questionId]?.lastResult as T) : undefined,
      );
      if (questionId) {
        const cb = () => {
          const result = check();
          setLastResult(result);
          return result;
        };
        if (!ref.current[questionId]) ref.current[questionId] = { lastCb: cb };
        else ref.current[questionId].lastCb = cb;
        return lastResult;
      }
      useEffect(() => {
        return () => {
          if (questionId) delete ref.current[questionId];
        };
      }, []);
      return;
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  return <TestContext.Provider value={{ mode, useOnCheck }}>{children}</TestContext.Provider>;
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTextContext must be used within a TextProvider');
  }
  return context;
};
