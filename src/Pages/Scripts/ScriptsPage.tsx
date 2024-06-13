import { useLocalStorage } from 'usehooks-ts';
import { useLangToLearnOptions } from '../../hooks/langs';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { CardType } from '../../database/types';
import FrenchVerbsScript from './scripts/fr/verbs.txt?raw';

const ScriptsPage = () => {
  const [langToLearn, setLangToLearn] = useLocalStorage('lang-to-learn', null as null | string);

  const supportsScripts = langToLearn === 'fr';

  const learnLangOptions = useLangToLearnOptions();

  const openLeo = () => {
    if (langToLearn === 'fr') {
      window.open(`https://dict.leo.org/anglais-fran%C3%A7ais/haben`, '_blank', 'noopener,noreferrer');
    }
  };

  const copyMainScript = (cardType: CardType) => {
    if (langToLearn === 'fr' && cardType === CardType.VERB) {
      navigator.clipboard.writeText(FrenchVerbsScript);
    }
  };

  const copyCopierScript = (cardType: CardType) => {
    if (langToLearn === 'fr' && cardType === CardType.VERB) {
      navigator.clipboard.writeText(`copy(copyVerbTable())`);
    }
  };

  return (
    <div className='body'>
      {' '}
      <div style={{ display: 'flex', gap: 10 }}>
        <label>Main language:</label>
        <Select
          options={learnLangOptions}
          onChange={setLangToLearn}
          value={langToLearn}
          style={{ width: 300 }}
          placeholder='Select language'
        />
      </div>
      <br />
      {supportsScripts && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          Verbs:
          <Button label='Open Leo' onClick={openLeo} />
          <Button label='Copy one-time script' onClick={() => copyMainScript(CardType.VERB)} />
          <Button label={"Copy 'copy' script"} onClick={() => copyCopierScript(CardType.VERB)} />
        </div>
      )}
    </div>
  );
};

export default ScriptsPage;
