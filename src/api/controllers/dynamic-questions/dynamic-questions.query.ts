import { useQuery } from '../../../utils/queries';
import { dynamicQuestionController } from './dynamic-questions.controller';
import type { GetDynamicQuestionReqDTO } from './dynamic-questions.schema';

const DynamicQuestionsQueryKeys = {
  generateQuestion: (query: GetDynamicQuestionReqDTO | null) =>
    !query ? ['dynamicQuestions:generate'] : ['dynamicQuestions:generate', query],
};

export const useDynamicQuestion = (query: GetDynamicQuestionReqDTO | null) => {
  return useQuery({
    queryFn: () => dynamicQuestionController.generateDynamicQuestion(query!),
    queryKey: DynamicQuestionsQueryKeys.generateQuestion(query),
    enabled: !!query,
  });
};
