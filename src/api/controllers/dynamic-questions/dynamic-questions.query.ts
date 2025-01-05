import { useQuery } from '../../../utils/queries';
import { dynamicQuestionController } from './dynamic-questions.controller';
import type { GetDynamicQuestionReqDTO } from './dynamic-questions.schema';

const DynamicQuestionsQueryKeys = {
  generateQuestion: (query: GetDynamicQuestionReqDTO | null) =>
    !query ? ['dynamicQuestions:generate'] : ['dynamicQuestions:generate', query],
};

export const useDynamicQuestion = (query: (GetDynamicQuestionReqDTO & { regIndex?: number }) | null) => {
  return useQuery({
    queryFn: () =>
      dynamicQuestionController.generateDynamicQuestion({
        ...query!,
        regenerate: !!query!.regIndex,
      }),
    queryKey: DynamicQuestionsQueryKeys.generateQuestion(query),
    enabled: !!query,
  });
};
