function cpNounFormatValue(value) {
  return '$$$' + value + '%%%';
}

function cpNounParseEnums(value) {
  return value.replace(/"\$\$\$(.*?)%%%"/g, '$1');
}

function cpVerbConvertMoodName(moodName) {
  if (!moodName) throw new Error('undefined mood');
  switch (moodName) {
    case 'Indikativ':
      return cpNounFormatValue('VerbMood.Indikativ');
    case 'Konjunktiv':
      return cpNounFormatValue('VerbMood.Konjunktiv');
    case 'Imperativ':
      return cpNounFormatValue('VerbMood.Imperativ');
    default:
      throw new Error('Invalid mood name ' + moodName);
  }
}

function cpVerbConvertTenseName(tenseName, moodName) {
  if (!tenseName) throw new Error('undefined tense in mood ' + moodName);
  if (tenseName.indexOf('Präsens') !== -1) return cpNounFormatValue('VerbTense.Präsens');
  if (tenseName.indexOf('Perfekt') !== -1) return cpNounFormatValue('VerbTense.Perfekt');
  if (tenseName.indexOf('Präteritum') !== -1) return cpNounFormatValue('VerbTense.Präteritum');
  if (tenseName.indexOf('Plusquamperfekt') !== -1) return cpNounFormatValue('VerbTense.Plusquamperfekt');
  if (tenseName.indexOf('Futur II') !== -1) return cpNounFormatValue('VerbTense.Futur2');
  if (tenseName.indexOf('Futur I') !== -1) return cpNounFormatValue('VerbTense.Futur1');
  throw new Error('Invalid tense name ' + tenseName + ' in mood ' + moodName);
}

function cpVerbConvertPronounName(pronounName) {
  if (!pronounName) throw new Error('undefined pronoun');
  if (pronounName.indexOf('ich') !== -1) return cpNounFormatValue('VerbPronoun.ich');
  if (pronounName.indexOf('du') !== -1) return cpNounFormatValue('VerbPronoun.du');
  if (pronounName.indexOf('er/sie/es') !== -1) return cpNounFormatValue('VerbPronoun.er_sie_es');
  if (pronounName.indexOf('wir') !== -1) return cpNounFormatValue('VerbPronoun.wir');
  if (pronounName.indexOf('ihr') !== -1) return cpNounFormatValue('VerbPronoun.ihr');
  if (pronounName.indexOf('sie') !== -1 || pronounName.indexOf('Sie') !== -1)
    return cpNounFormatValue('VerbPronoun.sie_Sie');
  throw new Error('Invalid pronoun name ' + pronounName);
}

function cpVerbGetConjugationVariant(value, moodName) {
  if (moodName === cpNounFormatValue('VerbMood.Indikativ') || moodName === cpNounFormatValue('VerbMood.Konjunktiv')) {
    const firstSpace = value.indexOf(' ');
    const pronoun = value.substring(0, firstSpace);
    if (pronoun === '-') return null;
    const conj = value.substring(firstSpace + 1);
    return {
      pronoun: cpVerbConvertPronounName(pronoun),
      value: conj,
    };
  } else if (moodName === cpNounFormatValue('VerbMood.Imperativ')) {
    const lastSpace = value.lastIndexOf(' ');
    const pronoun = value
      .substring(lastSpace + 1)
      .replace('(', '')
      .replace(')', '');
    if (pronoun === '-') return null;
    const conj = value.substring(0, lastSpace);
    return {
      pronoun: cpVerbConvertPronounName(pronoun),
      value: conj,
    };
  } else {
    throw new Error('Unsupported mood (for conjugation) ' + moodName);
  }
}

function generateSlashVariants(value) {
  const match = value.match(/([a-zA-ZäöüÄÖÜß]+)\/([a-zA-ZäöüÄÖÜß]+)/);
  if (!match) return [value];
  const first = match[1];
  const second = match[2];
  const matchLength = match[0].length;
  const firstValue = value.substring(0, match.index) + first + value.substring(match.index + matchLength);
  const secondValue = value.substring(0, match.index) + second + value.substring(match.index + matchLength);
  return [firstValue, secondValue];
}

function copyVerbTable() {
  const verbValue = document.querySelector('#search-field').value.trim();
  const verb = {
    type: cpNounFormatValue('CardType.VERB'),
    value: verbValue,
    translation: '',
    variants: [],
  };
  document.querySelectorAll('.flect-tables-container').forEach((mood, index) => {
    if (index > 2) return;
    const moodName = mood.parentElement.querySelector('.bg-darkyellow').innerText;
    const moodValue = cpVerbConvertMoodName(moodName);

    const tensesArray = [];
    verb.variants.push({
      mood: moodValue,
      tenses: tensesArray,
    });

    const tables = Array.from(mood.querySelectorAll(`.tb-bg-alt-lightgray`));
    const texts = tables.map((table) => table.innerText);
    texts.forEach((text) => {
      const modifiedText = text.replaceAll('/\n', '/');
      const modifiedTextArr = modifiedText.split('\n');
      const tenseName = cpVerbConvertTenseName(modifiedTextArr[0], moodValue);
      const conjugations = [];
      tensesArray.push({
        tense: tenseName,
        conjugations,
      });
      modifiedTextArr.forEach((value, idx) => {
        if (idx === 0) return value;
        const conj = cpVerbGetConjugationVariant(value, moodValue);
        if (conj) conjugations.push(conj);
      });
      if (
        moodValue === cpNounFormatValue('VerbMood.Konjunktiv') &&
        (tenseName === cpNounFormatValue('VerbTense.Futur1') || tenseName === cpNounFormatValue('VerbTense.Futur2'))
      ) {
        const newConjugations = conjugations.map((conj) => {
          const variants = generateSlashVariants(conj.value);
          return { ...conj, value: variants[1] ?? variants[0] };
        });
        conjugations.forEach((conj) => {
          conj.value = generateSlashVariants(conj.value)[0];
        });
        const anotherTenseName =
          tenseName === cpNounFormatValue('VerbTense.Futur1')
            ? cpNounFormatValue('VerbTense.Futur2_1')
            : cpNounFormatValue('VerbTense.Futur2_2');
        tensesArray.push({
          tense: anotherTenseName,
          conjugations: newConjugations,
        });
      }
    });
  });
  const finalValue = cpNounParseEnums(JSON.stringify(verb));
  copy(finalValue);
}
