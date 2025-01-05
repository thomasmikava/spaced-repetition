import { FormOutlined, SettingFilled } from '@ant-design/icons/lib/icons';
import AntButton from 'antd/es/button';
import Dropdown from 'antd/es/dropdown';
import type { ItemType } from 'antd/es/menu/interface';
import type { FC } from 'react';
import { memo } from 'react';
import { useSnapshot } from 'valtio';
import { TranslationLangSelectorConnected } from '../../components/Lang/TranslationLangSelector';
import { settingsState } from '../../states/settings';
import { Checkbox } from '../../ui/Checkbox/Checkbox';
import { isNonNullable } from '../../utils/array';
import styles from './styles.module.css';

interface TopPartProps {
  shouldShowLangSwitcher: boolean;
  shouldShowControls: boolean;
  shouldShowHint: boolean;
  onHintClick?: () => void;
}

export const TopPart: FC<TopPartProps> = memo(
  ({ shouldShowLangSwitcher, shouldShowControls, shouldShowHint, onHintClick }) => {
    const langSwitcher = shouldShowLangSwitcher && (
      <div className={styles.transLangsContainer}>
        <TranslationLangSelectorConnected />
      </div>
    );
    const settingsSnap = useSnapshot(settingsState);

    const onToggle = () => {
      settingsState.showControls = !settingsState.showControls;
    };

    const settingsItems: ItemType[] | null = [
      shouldShowControls
        ? {
            label: <Checkbox label='Show controls' checked={settingsSnap.showControls} onClick={onToggle} />,
            key: 'control',
          }
        : null,
    ].filter(isNonNullable);

    const hint = shouldShowHint && (
      <div className={styles.hintContainer}>
        <AntButton onClick={onHintClick}>
          <FormOutlined />
        </AntButton>
      </div>
    );

    const settings = settingsItems.length > 0 && (
      <Dropdown
        menu={{
          items: settingsItems,
        }}
        placement='bottomLeft'
      >
        <AntButton>
          <SettingFilled />
        </AntButton>
      </Dropdown>
    );

    if (!settings && !langSwitcher && !hint) return null;

    return (
      <div className={styles.topContainer}>
        {settings}
        {hint}
        {langSwitcher}
      </div>
    );
  },
);
TopPart.displayName = 'TopPart';
