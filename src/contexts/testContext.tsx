/* eslint-disable react-hooks/rules-of-hooks */
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useLatestCallback } from '../utils/hooks';

interface QuestionResult {
  isCorrect: boolean;
}

type TestInfo = {
  mode: 'edit' | 'readonly';
  useOnCheck: <T extends QuestionResult>(questionId: string | undefined, check: () => T) => T | undefined;
  useOnHintListener: (questionId: string | undefined, onHint: () => void) => void | undefined;
};

const TestContext = createContext<TestInfo | null>(null);
TestContext.displayName = 'TestContextProvider';

type Props = {
  children: React.ReactNode;
  mode: TestInfo['mode'];
  onResult: (areAllCorrect: boolean) => void;
};

export interface TestContextRef {
  initiateHint: () => void;
}

export const TestContextProvider = forwardRef<TestContextRef, Props>(({ children, mode, onResult }, ref) => {
  const subscribersRef = useRef<
    Record<string, { lastCb?: () => QuestionResult; lastResult?: QuestionResult; lastHintCb?: () => void }>
  >({});
  const isMountedRef = useRef(false);
  const onLatestResult = useLatestCallback(onResult);

  useEffect(() => {
    if (mode !== 'readonly' || !isMountedRef.current) return;
    let areAllCorrect = true;
    for (const questionId in subscribersRef.current || {}) {
      const { lastCb } = subscribersRef.current[questionId];
      if (!lastCb) continue;
      const result = lastCb();
      subscribersRef.current[questionId].lastResult = result;
      if (!result.isCorrect) areAllCorrect = false;
    }
    onLatestResult(areAllCorrect);
  }, [mode, onLatestResult]);

  const initiateHint = useCallback(() => {
    for (const questionId in subscribersRef.current || {}) {
      const { lastHintCb } = subscribersRef.current[questionId];
      if (!lastHintCb) continue;
      lastHintCb();
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      initiateHint,
    }),
    [initiateHint],
  );

  const useOnCheck = useCallback(
    <T extends QuestionResult>(questionId: string | undefined, check: () => T): T | undefined => {
      const [lastResult, setLastResult] = useState<T | undefined>(
        questionId !== undefined ? (subscribersRef.current[questionId]?.lastResult as T) : undefined,
      );
      useEffect(() => {
        if (questionId) {
          const cb = () => {
            const result = check();
            setLastResult(result);
            return result;
          };
          if (!subscribersRef.current[questionId]) subscribersRef.current[questionId] = { lastCb: cb };
          else subscribersRef.current[questionId].lastCb = cb;
        }
        return () => {
          if (questionId) {
            const currentRecord = subscribersRef.current[questionId];
            if (currentRecord && currentRecord.lastCb) {
              delete currentRecord.lastCb;
              delete currentRecord.lastResult;
              if (Object.keys(currentRecord).length === 0) delete subscribersRef.current[questionId];
            }
          }
        };
      }, [questionId, check]);

      return lastResult;
    },
    [],
  );

  const useOnHintListener = useCallback((questionId: string | undefined, onHint: () => void): void | undefined => {
    useEffect(() => {
      if (questionId) {
        const cb = onHint;
        if (!subscribersRef.current[questionId]) subscribersRef.current[questionId] = { lastHintCb: cb };
        else subscribersRef.current[questionId].lastHintCb = cb;
      }
      return () => {
        if (questionId) {
          const currentRecord = subscribersRef.current[questionId];
          if (currentRecord && currentRecord.lastHintCb) {
            delete currentRecord.lastHintCb;
            if (Object.keys(currentRecord).length === 0) delete subscribersRef.current[questionId];
          }
        }
      };
    }, [questionId, onHint]);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  return <TestContext.Provider value={{ mode, useOnCheck, useOnHintListener }}>{children}</TestContext.Provider>;
});

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTextContext must be used within a TextProvider');
  }
  return context;
};
