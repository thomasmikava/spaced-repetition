function cpNounFormatValue(value) {
  return '$$$' + value + '%%%';
}

function cpNounParseEnums(value) {
  return value.replace(/"\$\$\$(.*?)%%%"/g, '$1');
}

function cpNounConvertCaseName(caseName) {
  if (!caseName) throw new Error('undefined case');
  switch (caseName) {
    case 'Nominativ':
      return cpNounFormatValue('Case.Nominativ');
    case 'Genitiv':
      return cpNounFormatValue('Case.Genitiv');
    case 'Dativ':
      return cpNounFormatValue('Case.Dativ');
    case 'Akkusativ':
      return cpNounFormatValue('Case.Akkusativ');
    default:
      throw new Error('Invalid case name ' + caseName);
  }
}

function cpNounRemoveArticle(value) {
  if (value.indexOf('der ') === 0 || value.indexOf('Der ') === 0) return value.substring(4);
  if (value.indexOf('die ') === 0 || value.indexOf('Die ') === 0) return value.substring(4);
  if (value.indexOf('das ') === 0 || value.indexOf('Das ') === 0) return value.substring(4);
  return value;
}

function cpNounConvertGender(value) {
  if (value.indexOf('der ') === 0 || value.indexOf('Der ') === 0) return cpNounFormatValue('NounGender.Maskulinum');
  if (value.indexOf('die ') === 0 || value.indexOf('Die ') === 0) return cpNounFormatValue('NounGender.Femininum');
  if (value.indexOf('das ') === 0 || value.indexOf('Das ') === 0) return cpNounFormatValue('NounGender.Neutrum');
  throw new Error('Cannot get gender from ' + value);
}

function copyNounTable() {
  const nounValue = cpNounRemoveArticle(document.querySelector('#search-field').value).trim();
  const noun = {
    type: cpNounFormatValue('CardType.NOUN'),
    value: nounValue,
    translation: '',
    gender: '',
    variants: [],
  };
  const table = document.querySelector('.tb-bg-alt-lightgray');
  const caseNames = Array.from(table.querySelectorAll('tbody tr td:first-child')).map((e) => e.innerText);
  const caseValues = caseNames.map(cpNounConvertCaseName);

  const singularNames = Array.from(table.querySelectorAll('tbody tr td:nth-child(2)')).map((e) => e.innerText);
  const pluralNames = Array.from(table.querySelectorAll('tbody tr td:nth-child(3)')).map((e) => e.innerText);

  const normalizeValue = (value) => {
    const text = value.replaceAll('/\n', '/');
    const afterFirstSpace = text.substring(text.indexOf(' ') + 1);
    return afterFirstSpace;
  };

  singularNames.forEach((value, index) => {
    const caseValue = caseValues[index];
    if (value === '-') return;
    noun.variants.push({
      number: cpNounFormatValue('NounNumber.singular'),
      case: caseValue,
      value: normalizeValue(value),
    });
  });

  noun.gender = cpNounConvertGender(singularNames[0] === '-' ? pluralNames[0] : singularNames[0]);

  pluralNames.forEach((value, index) => {
    const caseValue = caseValues[index];
    if (value === '-') return;
    noun.variants.push({
      number: cpNounFormatValue('NounNumber.plural'),
      case: caseValue,
      value: normalizeValue(value),
    });
  });

  const finalValue = cpNounParseEnums(JSON.stringify(noun));
  copy(finalValue);
}
