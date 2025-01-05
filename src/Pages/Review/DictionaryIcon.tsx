import { BookOutlined } from '@ant-design/icons/lib/icons';
import { useState } from 'react';
import cssModule from '../../App.module.css';
import { DictionaryLoadedModal } from '../../components/DictionaryModal';
import type { StandardCard } from '../../database/types';
import type { Helper } from '../../functions/generate-card-content';

export const DictionaryIcon = ({ card, helper }: { card: StandardCard; helper: Helper }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <button onClick={handleOpen} className={cssModule.bigDictionaryButton}>
        <span>
          <BookOutlined />
        </span>
      </button>
      {isOpen && <DictionaryLoadedModal word={null} card={card} helper={helper} onClose={handleClose} />}
    </>
  );
};
