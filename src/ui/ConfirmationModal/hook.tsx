import type { ReactNode } from 'react';
import { useState } from 'react';
import type { ConfirmModalProps } from './ConfirmationModal';
import { createPortal } from 'react-dom';
import { ConfirmationModal } from './ConfirmationModal';

export const useConfirmationModal = () => {
  const [confirmationModalElement, setConfirmationModalElement] = useState<ReactNode>(null);

  const open = (args: ConfirmModalProps & { onClose?: () => void }) => {
    const onClose = () => {
      setConfirmationModalElement(null);
      args.onClose?.();
    };
    setConfirmationModalElement(createPortal(<ConfirmationModal {...args} onClose={onClose} />, document.body));
  };

  return {
    openConfirmationModal: open,
    confirmationModalElement,
  };
};
