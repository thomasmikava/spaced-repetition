import { useSnapshot } from 'valtio';
import { settingsState } from '../../states/settings';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState, type FC } from 'react';
import styles from './styles.module.css';
import type { Reviewer, ReviewerCard } from '../../functions/reviewer';
import {
  calculateHalfLifeCoefficient,
  secondsUntilProbabilityIsHalf,
  type CardViewMode,
} from '../../functions/reviews';
import { formatTime } from '../../utils/time';
import EditOutlined from '@ant-design/icons/lib/icons/EditOutlined';
import { PlusOutlined } from '@ant-design/icons';
import Modal from 'antd/es/modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import type { ModifierState, StateModifierRef } from './StateModifier';
import StateModifier from './StateModifier';
import type { Helper } from '../../functions/generate-card-content';
import type { Preferences } from '../../functions/preferences';

interface Props {
  canChange: boolean;
  card: ReviewerCard;
  isCorrect: boolean;
  mode: CardViewMode;
  reviewer: Reviewer;
  helper: Helper;
  reviewBlock: number;
  isStateModifierHidden?: boolean;
  preferences: Preferences;
}

export interface ControlRef {
  getNewS: () => number | undefined;
  getStates: () => ModifierState[];
}

const CardControlsInner = forwardRef<ControlRef, Props>(
  ({ reviewer, card, mode, isCorrect, helper, reviewBlock, isStateModifierHidden, preferences }, ref) => {
    const timeOptionsRef = useRef<TimeOptionsRef>(null);
    const stateModifierRef = useRef<StateModifierRef>(null);
    const hasAnotherRepetition = reviewer.hasAnotherRepetition(card.record, mode, isCorrect);

    const currentS = reviewer.prevReviews.getCurrentS(card.record, mode, reviewBlock);
    const newS = reviewer.prevReviews.getNewS(card.record, mode, isCorrect, reviewBlock, preferences);

    const options =
      newS === null
        ? null
        : isCorrect
          ? getDateOptions(isCorrect, currentS, newS, 1, 2)
          : getDateOptions(isCorrect, currentS, newS, 2, 1);

    const showSModifier = !!hasAnotherRepetition && newS !== null && !!options;
    const showStateModifier = !isStateModifierHidden;

    useImperativeHandle(ref, () => ({
      getNewS: () => timeOptionsRef.current?.s ?? undefined,
      getStates: () => stateModifierRef.current?.actions ?? [],
    }));

    // if (!hasAnotherRepetition) return null
    return (
      <div className={styles.controlsContainer}>
        {showSModifier && <TimeOptions ref={timeOptionsRef} options={options} />}
        {showStateModifier && (
          <StateModifier
            ref={stateModifierRef}
            testableCard={card.record}
            lang={card.record.card.lang}
            helper={helper}
            mode={mode}
          />
        )}
      </div>
    );
  },
);

interface TimeOptionsRef {
  s: number | undefined;
}

const TimeOptions = forwardRef<TimeOptionsRef, { options: Item[] }>(({ options }, ref) => {
  const [selectedOption, setSelectedOption] = useState(() => options.find((e) => e.isDefault));
  const [customOption, setCustomOption] = useState<Item>();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const onCustomOptionChoose = (date: number) => {
    const s = calculateHalfLifeCoefficient(date);
    const option: Item = {
      d: date,
      s,
      isCustom: true,
    };
    setCustomOption(option);
    setSelectedOption(option);
    setIsCustomModalOpen(false);
  };

  useImperativeHandle(ref, () => ({ s: selectedOption?.s }));

  const allOptions = customOption ? options.concat([customOption]) : options;

  return (
    <div className={styles.timeLineContainer}>
      <span>Ask me in:</span>
      <div className={styles.timeOptionsContainer}>
        <>
          {allOptions.map((option, i) => {
            const className = `${styles.option} ${option.isDefault ? styles.defaultOption : ''} ${option.d === selectedOption?.d && option.s === selectedOption?.s ? styles.selected : ''}`;
            return (
              <button key={i} className={className} onClick={() => setSelectedOption(option)}>
                <span>{formatTime(option.d)}</span>
                {option.isCustom && <EditOutlined onClick={() => setIsCustomModalOpen(true)} />}
              </button>
            );
          })}
        </>
        {!customOption && (
          <button className={`${styles.option} ${styles.customSetter}`} onClick={() => setIsCustomModalOpen(true)}>
            <PlusOutlined />
            <span>custom</span>
          </button>
        )}
      </div>
      {isCustomModalOpen && (
        <CustomOptionModal
          defaultValue={customOption?.d}
          onCancel={() => setIsCustomModalOpen(false)}
          onApprove={onCustomOptionChoose}
        />
      )}
    </div>
  );
});

const CustomOptionModal: FC<{
  defaultValue: number | undefined;
  onCancel: () => void;
  onApprove: (value: number) => void;
}> = ({ defaultValue, onCancel, onApprove }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const d = defaultValue ?? 0;
  const dayN = Math.floor(d / (24 * 60 * 60));
  const hourN = Math.floor((d % (24 * 60 * 60)) / (60 * 60));
  const minuteN = Math.floor(d % 60);
  const [day, setDay] = useState(`${dayN}`);
  const [hour, setHour] = useState(`${hourN}`);
  const [minute, setMinute] = useState(`${minuteN}`);

  const handleApprove = () => {
    const newD = +day * 24 * 60 * 60 + +hour * 60 * 60 + +minute * 60;
    onApprove(newD);
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      <Button label={'Cancel'} onClick={onCancel} />
      <Button label={'Ok'} variant={'primary'} onClick={handleApprove} />
    </div>
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleApprove();
        e.stopPropagation();
      }
    };
    const el = modalRef.current;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <Modal
      title={'Set custom review time'}
      open={true}
      onOk={() => {}}
      onCancel={onCancel}
      width={500}
      style={{ maxWidth: 'calc(100% - 84px)' }}
      footer={footer}
    >
      <div className={styles.customTimesContainer} ref={modalRef}>
        <Input value={day} onChange={(e) => setDay(e.target.value)} label='Day' fullWidth={false} />
        <Input value={hour} onChange={(e) => setHour(e.target.value)} label='Hour' fullWidth={false} />
        <Input value={minute} onChange={(e) => setMinute(e.target.value)} label='Minute' fullWidth={false} />
      </div>
    </Modal>
  );
};

const getDateOptions = (
  _isCorrect: boolean,
  _currentS: number | null,
  newS: number,
  beforeCount: number,
  afterCount: number,
): Item[] => {
  // const h1 = currentS === null ? 0 : secondsUntilProbabilityIsHalf(currentS);
  const h2 = secondsUntilProbabilityIsHalf(newS);

  let beforeHalfDates: Item[] = [];
  let afterHalfDates: Item[] = [];

  beforeHalfDates = new Array(beforeCount)
    .fill(0)
    .map((_, i) => {
      const s = newS - newS * ((i + 1) * 0.1);
      return { s, d: secondsUntilProbabilityIsHalf(s) };
    })
    .reverse();
  afterHalfDates = new Array(afterCount).fill(0).map((_, i) => {
    const s = newS + newS * ((i + 1) * 1.1);
    return { s, d: secondsUntilProbabilityIsHalf(s) };
  });

  return [
    ...beforeHalfDates.map(rounder),
    { d: rounder({ s: newS, d: h2 }).d, s: newS, isDefault: true },
    ...afterHalfDates.map(rounder),
  ];
};

type Item = { s: number; d: number; isDefault?: boolean; isCustom?: boolean };

// eslint-disable-next-line sonarjs/cognitive-complexity
const rounder = (element: Item): Item => {
  const roundC =
    element.d < 60
      ? 5
      : element.d < 2 * 60
        ? 10
        : element.d < 5 * 60
          ? 20
          : element.d < 10 * 60
            ? 30
            : element.d < 2 * 60 * 60
              ? 60
              : element.d < 24 * 60 * 60
                ? 5 * 60
                : 10 * 60;
  const newD = Math.round(element.d / roundC) * roundC;
  const newS = calculateHalfLifeCoefficient(newD);
  return { s: newS, d: newD };
};

const CardControls = memo(
  forwardRef<ControlRef, Props>((props, ref) => {
    const [shouldShow, setShouldShow] = useState(false);
    const settingsSnap = useSnapshot(settingsState);

    const shouldRender = !!props.canChange && !!settingsSnap.showControls;

    useEffect(() => {
      let timer: number | null;
      if (shouldRender) {
        timer = setTimeout(() => {
          setShouldShow(true); // in case of incorrect answer, we first get isCorrect=true and then isCorrect=false, so to not render twice we need wait a bit
        }, 0);
      } else {
        setShouldShow(false);
        timer = null;
      }
      if (timer !== null) return () => clearTimeout(timer);
    }, [shouldRender]);

    if (!shouldRender || !shouldShow) return null;
    return (
      <CardControlsInner
        ref={ref}
        key={(props.isCorrect ? 1 : 0) + props.mode + '*' + props.card.record.testKey}
        {...props}
      />
    );
  }),
);

export { CardControls };
