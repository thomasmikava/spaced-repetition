import { forwardRef, memo, useImperativeHandle, useState, type FC } from 'react';
import type { StandardTestableCard } from '../../functions/reviews';
import { getGroupName } from '../../utils/group-name';
import type { Helper } from '../../functions/generate-card-content';
import styles from './styles.module.css';
import { isNonNullable } from '../../utils/array';

interface CurrentVariantState {
  type: 'variant';
  value: SecondOption;
  variantId: number;
  testViewId: string | null;
  cardId: number;
}
interface CurrentGroupState {
  type: 'group';
  value: SecondOption;
  groupId: string;
  cardId: number;
}
interface CurrentCardState {
  type: 'card';
  value: SecondOption;
  cardId: number;
}

export type ModifierState = CurrentVariantState | CurrentGroupState | CurrentCardState;

interface StateModifierProps {
  testableCard: StandardTestableCard;
  lang: string;
  helper: Helper;
}

export enum SecondOption {
  DEFAULT = 0,
  I_KNOW = 1,
  IGNORE = 2,
}

export interface StateModifierRef {
  actions: ModifierState[];
}

const StateModifier = memo(
  forwardRef<StateModifierRef, StateModifierProps>(({ testableCard, lang, helper }, ref) => {
    const [variantMetaValue, setVariantMetaValue] = useState(SecondOption.DEFAULT);
    const [groupCardMetaValue, setGroupCardMetaValue] = useState(SecondOption.DEFAULT);
    const [wholeCardMetaValue, setWholeCardMetaValue] = useState(SecondOption.DEFAULT);
    const card = testableCard.card;
    const variantsCount = card.variants.length;
    const groupName = testableCard.groupMeta.gr ? getGroupName(testableCard.groupMeta.gr, lang, helper) : null;
    const groupVariantCount = testableCard.groupMeta.variants.length;
    console.log(
      (
        [
          variantMetaValue === SecondOption.DEFAULT
            ? null
            : { type: 'variant', value: variantMetaValue, variantId: testableCard.variant.id, cardId: card.id },
          groupCardMetaValue === SecondOption.DEFAULT || !testableCard.groupMeta.gr
            ? null
            : { type: 'group', value: groupCardMetaValue, groupId: testableCard.groupMeta.gr.id, cardId: card.id },
          wholeCardMetaValue === SecondOption.DEFAULT
            ? null
            : { type: 'card', value: wholeCardMetaValue, cardId: card.id },
        ] as (ModifierState | null)[]
      ).filter(isNonNullable),
    );

    useImperativeHandle(ref, () => ({
      actions: (
        [
          variantMetaValue === SecondOption.DEFAULT
            ? null
            : {
                type: 'variant',
                value: variantMetaValue,
                variantId: testableCard.variant.id,
                cardId: card.id,
                testViewId: testableCard.groupMeta.testViewId,
              },
          groupCardMetaValue === SecondOption.DEFAULT || !testableCard.groupMeta.gr
            ? null
            : { type: 'group', value: groupCardMetaValue, groupId: testableCard.groupMeta.gr.id, cardId: card.id },
          wholeCardMetaValue === SecondOption.DEFAULT
            ? null
            : { type: 'card', value: wholeCardMetaValue, cardId: card.id },
        ] satisfies (ModifierState | null)[]
      ).filter(isNonNullable),
    }));

    return (
      <div>
        <div className={styles.statesEntities}>
          <div className={styles.statesLineContainer}>
            <span>Current variant</span>
            <Chooser value={variantMetaValue} onChange={setVariantMetaValue} />
          </div>

          {groupVariantCount > 0 && !!groupName && (
            <div className={styles.statesLineContainer}>
              <span>Group: {groupName}</span>
              <Chooser value={groupCardMetaValue} onChange={setGroupCardMetaValue} />
            </div>
          )}

          {variantsCount > 0 && (
            <div className={styles.statesLineContainer}>
              <span>All forms</span>
              <Chooser value={wholeCardMetaValue} onChange={setWholeCardMetaValue} />
            </div>
          )}
        </div>
      </div>
    );
  }),
);

interface ChooserProps {
  value: number;
  onChange: (value: number) => void;
}
const Chooser: FC<ChooserProps> = ({ value, onChange }) => {
  return (
    <div className={styles.statesOptionsContainer}>
      <button
        className={`${styles.option} ${value === SecondOption.I_KNOW ? styles.selected : ''}`}
        onClick={() => onChange(value === SecondOption.I_KNOW ? SecondOption.DEFAULT : SecondOption.I_KNOW)}
      >
        <span>I know</span>
      </button>
      <button
        className={`${styles.option} ${value === SecondOption.IGNORE ? styles.selected : ''}`}
        onClick={() => onChange(value === SecondOption.IGNORE ? SecondOption.DEFAULT : SecondOption.IGNORE)}
      >
        <span>Ignore</span>
      </button>
    </div>
  );
};

export default StateModifier;
