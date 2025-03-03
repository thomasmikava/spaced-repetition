import Modal from 'antd/es/modal';
import Skeleton from 'antd/es/skeleton';
import { useMemo, type FC } from 'react';
import { useOneWord } from '../../api/controllers/words/words.query';
import type { WordWithTranslationVariantsDTO } from '../../api/controllers/words/words.schema';
import { viewLinesToContentLines, type Helper } from '../../functions/generate-card-content';
import { generateTestableCards } from '../../functions/generate-variants';
import Content from '../../Content';
import { ViewLineType, type ViewLine } from '../../database/card-types';
import { transformToStandardCard } from '../../Pages/Review/useWords';
import type { StandardCard } from '../../database/types';
import { useUserPreferences } from '../../api/controllers/users/users.query';
import { calculatePreferences } from '../../functions/preferences';
import { getReviewBlockManager } from '../../functions/review-block';
import { ReviewBlock } from '../../api/controllers/history/history.schema';

const DictionaryModal: FC<{ helper: Helper; wordId: number; onClose: () => void; translationLangs: string[] }> = ({
  helper,
  wordId,
  onClose,
  translationLangs,
}) => {
  const { data: word } = useOneWord({ id: wordId, translationLangs, onlyOfficialTranslation: false });
  return <DictionaryLoadedModal onClose={onClose} word={word ?? null} helper={helper} />;
};

export type LoadedModalProps = {
  word: WordWithTranslationVariantsDTO | null;
  card?: StandardCard;
  helper: Helper;
  onClose: () => void;
};

export const DictionaryLoadedModal: FC<LoadedModalProps> = ({ onClose, word, card, helper }) => {
  const isLoaded = !!word || !!card;
  const { data: userPreferences } = useUserPreferences();

  const content = useMemo(() => {
    if (!word && !card) return null;
    if (!userPreferences) return null;
    const finalCard = card ?? transformToStandardCard(word!);
    const preferences = calculatePreferences(userPreferences.result, finalCard.lang);
    const config = helper.getCardType(finalCard.type, finalCard.lang)?.configuration ?? {};
    const variants = generateTestableCards(
      finalCard,
      helper,
      preferences,
      undefined,
      getReviewBlockManager(ReviewBlock.standard),
    );
    const viewLines = config.dictionaryView || DEFAULT_DICTIONARY_VIEW;
    return viewLinesToContentLines(viewLines, helper, variants[0], preferences).lineContents;
  }, [word, helper, card, userPreferences]);

  return (
    <Modal
      title={'Details'}
      open={true}
      onOk={() => {}}
      onCancel={onClose}
      footer={null}
      width={1200}
      style={{ maxWidth: 'calc(100% - 84px)' }}
    >
      {!isLoaded ? <Skeleton active /> : !content ? null : <Content content={content} />}
    </Modal>
  );
};

const DEFAULT_DICTIONARY_VIEW: ViewLine[] = [
  { type: ViewLineType.CardValue, bigText: true },
  { type: ViewLineType.Translation, includeLegend: true },
  { type: ViewLineType.TranslationVariants },
];

export default DictionaryModal;
