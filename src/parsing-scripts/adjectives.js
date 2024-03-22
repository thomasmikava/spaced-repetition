function cpAdjFormatValue(value) {
  return '$$$' + value + '%%%';
}

function cpAdjParseEnums(value) {
  return value.replace(/"\$\$\$(.*?)%%%"/g, '$1');
}

function cpAdjConvertCaseName(caseName) {
  if (!caseName) throw new Error('undefined case');
  switch (caseName) {
    case 'Nominativ':
      return cpAdjFormatValue('Case.Nominativ');
    case 'Genitiv':
      return cpAdjFormatValue('Case.Genitiv');
    case 'Dativ':
      return cpAdjFormatValue('Case.Dativ');
    case 'Akkusativ':
      return cpAdjFormatValue('Case.Akkusativ');
    default:
      throw new Error('Invalid case name ' + caseName);
  }
}

function extractTableData(tbody) {
  const rows = tbody.getElementsByTagName('tr');
  const tableData = [];

  for (let row of rows) {
    const cells = row.getElementsByTagName('td');
    const rowData = [];

    for (let cell of cells) {
      rowData.push(cell.innerText.replace(/\n/g, '').trim());
    }

    tableData.push(rowData);
  }

  return tableData;
}

function copyAdjectiveTable() {
  const adjectiveValue = document.querySelector('#search-field').value.trim();
  const adjective = {
    type: cpAdjFormatValue('CardType.ADJECTIVE'),
    value: adjectiveValue,
    translation: '',
    komparativ: null,
    superlativ: null,
    variants: [],
  };

  document.querySelectorAll('.wgt-fullsize .m-v-large, .wgt-fullsize .section').forEach((table) => {
    const tableName = table.querySelector('h3,.bg-darkyellow').innerText;
    if (tableName.startsWith('Grundformen')) {
      const [comperative, superlative] = Array.from(table.querySelectorAll('td')).map((e) => e.innerText);
      adjective.komparativ = comperative.replace(/\n/g, '').trim();
      adjective.superlativ = superlative.replace(/\n/g, '').trim();
      return;
    }

    let degree = cpAdjFormatValue('AdjectiveDegree.Positiv');
    if (tableName.startsWith('Komparativ')) degree = cpAdjFormatValue('AdjectiveDegree.Komparativ');
    if (tableName.startsWith('Superlativ')) degree = cpAdjFormatValue('AdjectiveDegree.Superlativ');

    let inflection = cpAdjFormatValue('AdjectiveInflection.Strong');
    if (tableName.includes('chwache Flexion')) inflection = cpAdjFormatValue('AdjectiveInflection.Weak');
    if (tableName.includes('emischte Flexion')) inflection = cpAdjFormatValue('AdjectiveInflection.Mixed');

    const hasArticles = tableName.includes('bestimmtem');

    const content = extractTableData(table.querySelector('tbody'));
    const variants = content.map((row) => {
      const [caseName, masculineValue, feminineValue, neutralValue, pluralValue] = row;
      const caseValue = cpAdjConvertCaseName(caseName);
      const restValues = [masculineValue, feminineValue, neutralValue, pluralValue].map((e) =>
        hasArticles ? e.substring(e.indexOf(' ') + 1) : e,
      );
      return [caseValue, ...restValues];
    });

    adjective.variants.push({
      degree,
      inflection,
      values: variants,
    });
  });

  const finalValue = cpAdjParseEnums(JSON.stringify(adjective));
  copy(finalValue);
}
