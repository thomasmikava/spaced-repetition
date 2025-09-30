import{u as c,a as m,j as n,S as p,B as a,C as e}from"./index-9H1PEzZs.js";const f=`function cpVerbConvertMoodName(moodName) {\r
  if (!moodName) throw new Error('undefined mood');\r
  switch (moodName) {\r
    case 'Indicatif':\r
      return 27;\r
    case 'Subjonctif':\r
      return 56;\r
    case 'Conditionnel':\r
      return 57;\r
    case 'Impératif':\r
      return 29;\r
    case 'Temps impersonnels':\r
      return null;\r
    default:\r
      throw new Error('Invalid mood name ' + moodName);\r
  }\r
}\r
function cpVerbConvertTenseName(tenseName, moodId) {\r
  if (!tenseName) throw new Error('undefined tense in mood ' + moodId);\r
  if (tenseName === 'Présent') return 21;\r
  if (tenseName === 'Passé composé') return 50;\r
  if (tenseName === 'Imparfait') return 51;\r
  if (tenseName === 'Plus-que-parfait') return 52;\r
  if (tenseName === 'Passé simple') return 47;\r
  if (tenseName === 'Passé antérieur') return 53;\r
  if (tenseName === 'Futur simple') return 48;\r
  if (tenseName === 'Futur antérieur') return 49;\r
  if (tenseName === 'Passé') return 46;\r
  if (tenseName === 'Passé 1ère forme') return 54;\r
  if (tenseName === 'Passé 2ème forme') return 55;\r
  if (\r
    ['Participe présent', 'Participe passé', 'Participe passé composé', 'Gérondif présent', 'Gérondif passé'].includes(\r
      tenseName,\r
    )\r
  ) {\r
    return null;\r
  }\r
  throw new Error('Invalid tense name ' + tenseName + ' in mood ' + moodId);\r
}\r
function cpVerbConvertPronounIndex(index) {\r
  switch (index) {\r
    case 0:\r
      return 11;\r
    case 1:\r
      return 12;\r
    case 2:\r
      return 16;\r
    case 3:\r
      return 17;\r
    case 4:\r
      return 18;\r
    case 5:\r
      return 19;\r
  }\r
  throw new Error('Invalid pronoun index ' + index);\r
}\r
function cpVerbConvertImperativePronounIndex(index) {\r
  switch (index) {\r
    case 0:\r
      return 58;\r
    case 1:\r
      return 59;\r
    case 2:\r
      return 60;\r
  }\r
  throw new Error('Invalid pronoun index ' + index);\r
}\r
function mapValueConjugation(value) {\r
  return value.replace("'il/elle ", "'(il/elle) ").replace("'ils/elles ", "'(ils/elles) ");\r
}\r
function removeLastParentheses(str) {\r
  const lastOpenIndex = str.lastIndexOf('(');\r
  if (lastOpenIndex === -1) {\r
    return str;\r
  }\r
  const lastCloseIndex = str.indexOf(')', lastOpenIndex);\r
  if (lastCloseIndex === -1) {\r
    return str;\r
  }\r
  return str.substring(0, lastOpenIndex) + str.substring(lastCloseIndex + 1);\r
}\r
function cpVerbGetConjugationVariant(value, index, moodId) {\r
  if (value === '-' || !value) return null;\r
  if (moodId === 27 || moodId === 56 || moodId === 57) {\r
    return {\r
      pronoun: cpVerbConvertPronounIndex(index),\r
      value: mapValueConjugation(value),\r
    };\r
  }\r
  if (moodId === 29) {\r
    // imperative\r
    return {\r
      imperativePronoun: cpVerbConvertImperativePronounIndex(index),\r
      value: removeLastParentheses(value).trim(),\r
    };\r
  } else {\r
    throw new Error('Unsupported mood (for conjugation) ' + moodId);\r
  }\r
}\r
function copyVerbTable() {\r
  let _a;\r
  const verbValue = (_a = document.querySelector('#search-field')) === null || _a === void 0 ? void 0 : _a.value.trim();\r
  const verb = {\r
    type: 3,\r
    value: verbValue,\r
    lang: 'fr',\r
    translation: '',\r
    variants: [{ categoryId: 1, value: verbValue }],\r
    isOfficial: true,\r
  };\r
  document.querySelectorAll('.flect-tables-container').forEach((mood, index) => {\r
    const moodName = mood.parentElement.querySelector('.bg-darkyellow').innerText;\r
    const moodId = cpVerbConvertMoodName(moodName);\r
    const tables = Array.from(mood.querySelectorAll(\`.tb-bg-alt-lightgray\`));\r
    const texts = tables.map((table) => table.innerText);\r
    texts.forEach((text) => {\r
      const modifiedText = text.replaceAll('/\\n', '/');\r
      const column = modifiedText.split('\\n');\r
      const tenseName = column[0];\r
      const tenseId = cpVerbConvertTenseName(tenseName, moodId);\r
      column.forEach((cell, idx) => {\r
        let _a, _b;\r
        if (idx === 0) return cell; // header\r
        const trimmedValue = cell.trim();\r
        if (!trimmedValue || trimmedValue === '-') return;\r
        if (tenseName === 'Participe présent') {\r
          return verb.variants.push({\r
            value: trimmedValue,\r
            attrs: { 12: 61 },\r
          });\r
        }\r
        if (tenseName === 'Participe passé composé') {\r
          return verb.variants.push({\r
            value: trimmedValue,\r
            attrs: { 12: 63 },\r
          });\r
        }\r
        if (tenseName === 'Gérondif présent') {\r
          return verb.variants.push({\r
            value: trimmedValue,\r
            attrs: { 12: 64 },\r
          });\r
        }\r
        if (tenseName === 'Gérondif passé') {\r
          return verb.variants.push({\r
            value: trimmedValue,\r
            attrs: { 12: 65 },\r
          });\r
        }\r
        if (tenseName === 'Participe passé') {\r
          const attrs = {\r
            0: { 2: 3, 1: 1, 12: 62 },\r
            1: { 2: 4, 1: 1, 12: 62 },\r
            2: { 2: 3, 1: 2, 12: 62 },\r
            3: { 2: 4, 1: 2, 12: 62 }, // feminine plural\r
          }[idx - 1];\r
          if (!attrs) {\r
            throw new Error('Invalid index ' + (idx - 1) + ' for Participe passé');\r
          }\r
          return verb.variants.push({\r
            value: trimmedValue,\r
            attrs,\r
          });\r
        }\r
        if (tenseId === null) {\r
          throw new Error('Invalid tense ' + tenseName);\r
        }\r
        const conj = cpVerbGetConjugationVariant(cell, idx - 1, moodId);\r
        if (conj && (typeof conj.pronoun === 'number' || typeof conj.imperativePronoun === 'number')) {\r
          verb.variants.push({\r
            value: conj.value,\r
            attrs: {\r
              4: (_a = conj.pronoun) !== null && _a !== void 0 ? _a : undefined,\r
              5: tenseId !== null && tenseId !== void 0 ? tenseId : undefined,\r
              6: moodId !== null && moodId !== void 0 ? moodId : undefined,\r
              11: (_b = conj.imperativePronoun) !== null && _b !== void 0 ? _b : undefined,\r
            },\r
          });\r
        }\r
      });\r
    });\r
  });\r
  return JSON.stringify(verb);\r
}\r
`,x=()=>{const[r,o]=c("lang-to-learn",null),s=r==="fr",i=m(),l=()=>{r==="fr"&&window.open("https://dict.leo.org/anglais-fran%C3%A7ais/haben","_blank","noopener,noreferrer")},u=t=>{r==="fr"&&t===e.VERB&&navigator.clipboard.writeText(f)},d=t=>{r==="fr"&&t===e.VERB&&navigator.clipboard.writeText("copy(copyVerbTable())")};return n.jsxs("div",{className:"body",children:[" ",n.jsxs("div",{style:{display:"flex",gap:10},children:[n.jsx("label",{children:"Main language:"}),n.jsx(p,{options:i,onChange:o,value:r,style:{width:300},placeholder:"Select language"})]}),n.jsx("br",{}),s&&n.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:["Verbs:",n.jsx(a,{label:"Open Leo",onClick:l}),n.jsx(a,{label:"Copy one-time script",onClick:()=>u(e.VERB)}),n.jsx(a,{label:"Copy 'copy' script",onClick:()=>d(e.VERB)})]})]})};export{x as default};
