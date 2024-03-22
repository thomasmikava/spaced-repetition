import type { Adjective } from './types';
import { AdjectiveDegree, AdjectiveInflection, CardType, Case } from './types';

export const adjectives: Adjective[] = [
  {
    type: CardType.ADJECTIVE,
    value: 'ganz',
    translation: 'whole; all the',
    komparativ: 'ganzer',
    superlativ: 'am ganzsten',
    variants: [
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'ganzer', 'ganze', 'ganzes', 'ganze'],
          [Case.Genitiv, 'ganzen', 'ganzer', 'ganzen', 'ganzer'],
          [Case.Dativ, 'ganzem', 'ganzer', 'ganzem', 'ganzen'],
          [Case.Akkusativ, 'ganzen', 'ganze', 'ganzes', 'ganze'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'ganze', 'ganze', 'ganze', 'ganzen'],
          [Case.Genitiv, 'ganzen', 'ganzen', 'ganzen', 'ganzen'],
          [Case.Dativ, 'ganzen', 'ganzen', 'ganzen', 'ganzen'],
          [Case.Akkusativ, 'ganzen', 'ganze', 'ganze', 'ganzen'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'ganzer', 'ganze', 'ganzes', 'ganzen'],
          [Case.Genitiv, 'ganzen', 'ganzen', 'ganzen', 'ganzen'],
          [Case.Dativ, 'ganzen', 'ganzen', 'ganzen', 'ganzen'],
          [Case.Akkusativ, 'ganzen', 'ganze', 'ganzes', 'ganzen'],
        ],
      },
      {
        degree: AdjectiveDegree.Komparativ,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'ganzerer', 'ganzere', 'ganzeres', 'ganzere'],
          [Case.Genitiv, 'ganzeren', 'ganzerer', 'ganzeren', 'ganzerer'],
          [Case.Dativ, 'ganzerem', 'ganzerer', 'ganzerem', 'ganzeren'],
          [Case.Akkusativ, 'ganzeren', 'ganzere', 'ganzeres', 'ganzere'],
        ],
      },
      {
        degree: AdjectiveDegree.Komparativ,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'ganzere', 'ganzere', 'ganzere', 'ganzeren'],
          [Case.Genitiv, 'ganzeren', 'ganzeren', 'ganzeren', 'ganzeren'],
          [Case.Dativ, 'ganzeren', 'ganzeren', 'ganzeren', 'ganzeren'],
          [Case.Akkusativ, 'ganzeren', 'ganzere', 'ganzere', 'ganzeren'],
        ],
      },
      {
        degree: AdjectiveDegree.Komparativ,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'ganzerer', 'ganzere', 'ganzeres', 'ganzeren'],
          [Case.Genitiv, 'ganzeren', 'ganzeren', 'ganzeren', 'ganzeren'],
          [Case.Dativ, 'ganzeren', 'ganzeren', 'ganzeren', 'ganzeren'],
          [Case.Akkusativ, 'ganzeren', 'ganzere', 'ganzeres', 'ganzeren'],
        ],
      },
      {
        degree: AdjectiveDegree.Superlativ,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'ganzster', 'ganzste', 'ganzstes', 'ganzste'],
          [Case.Genitiv, 'ganzsten', 'ganzster', 'ganzsten', 'ganzster'],
          [Case.Dativ, 'ganzstem', 'ganzster', 'ganzstem', 'ganzsten'],
          [Case.Akkusativ, 'ganzsten', 'ganzste', 'ganzstes', 'ganzste'],
        ],
      },
      {
        degree: AdjectiveDegree.Superlativ,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'ganzste', 'ganzste', 'ganzste', 'ganzsten'],
          [Case.Genitiv, 'ganzsten', 'ganzsten', 'ganzsten', 'ganzsten'],
          [Case.Dativ, 'ganzsten', 'ganzsten', 'ganzsten', 'ganzsten'],
          [Case.Akkusativ, 'ganzsten', 'ganzste', 'ganzste', 'ganzsten'],
        ],
      },
      {
        degree: AdjectiveDegree.Superlativ,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'ganzster', 'ganzste', 'ganzstes', 'ganzsten'],
          [Case.Genitiv, 'ganzsten', 'ganzsten', 'ganzsten', 'ganzsten'],
          [Case.Dativ, 'ganzsten', 'ganzsten', 'ganzsten', 'ganzsten'],
          [Case.Akkusativ, 'ganzsten', 'ganzste', 'ganzstes', 'ganzsten'],
        ],
      },
    ],
  },
  {
    type: CardType.ADJECTIVE,
    value: 'beste',
    translation: 'best',
    komparativ: null,
    superlativ: null,
    variants: [
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'bester', 'beste', 'bestes', 'beste'],
          [Case.Genitiv, 'besten', 'bester', 'besten', 'bester'],
          [Case.Dativ, 'bestem', 'bester', 'bestem', 'besten'],
          [Case.Akkusativ, 'besten', 'beste', 'bestes', 'beste'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'beste', 'beste', 'beste', 'besten'],
          [Case.Genitiv, 'besten', 'besten', 'besten', 'besten'],
          [Case.Dativ, 'besten', 'besten', 'besten', 'besten'],
          [Case.Akkusativ, 'besten', 'beste', 'beste', 'besten'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'bester', 'beste', 'bestes', 'besten'],
          [Case.Genitiv, 'besten', 'besten', 'besten', 'besten'],
          [Case.Dativ, 'besten', 'besten', 'besten', 'besten'],
          [Case.Akkusativ, 'besten', 'beste', 'bestes', 'besten'],
        ],
      },
    ],
  },
  {
    type: CardType.ADJECTIVE,
    value: 'weitere',
    translation: 'additioinal',
    komparativ: null,
    superlativ: null,
    variants: [
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'weiterer', 'weitere', 'weiteres', 'weitere'],
          [Case.Genitiv, 'weiteren', 'weiterer', 'weiteren', 'weiterer'],
          [Case.Dativ, 'weiterem', 'weiterer', 'weiterem', 'weiteren'],
          [Case.Akkusativ, 'weiteren', 'weitere', 'weiteres', 'weitere'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'weitere', 'weitere', 'weitere', 'weiteren'],
          [Case.Genitiv, 'weiteren', 'weiteren', 'weiteren', 'weiteren'],
          [Case.Dativ, 'weiteren', 'weiteren', 'weiteren', 'weiteren'],
          [Case.Akkusativ, 'weiteren', 'weitere', 'weitere', 'weiteren'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'weiterer', 'weitere', 'weiteres', 'weiteren'],
          [Case.Genitiv, 'weiteren', 'weiteren', 'weiteren', 'weiteren'],
          [Case.Dativ, 'weiteren', 'weiteren', 'weiteren', 'weiteren'],
          [Case.Akkusativ, 'weiteren', 'weitere', 'weiteres', 'weiteren'],
        ],
      },
    ],
  },
  {
    type: CardType.ADJECTIVE,
    value: 'genau',
    translation: 'exact',
    komparativ: 'genauer',
    superlativ: 'am genausten/genauesten',
    variants: [
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'genauer', 'genaue', 'genaues', 'genaue'],
          [Case.Genitiv, 'genauen', 'genauer', 'genauen', 'genauer'],
          [Case.Dativ, 'genauem', 'genauer', 'genauem', 'genauen'],
          [Case.Akkusativ, 'genauen', 'genaue', 'genaues', 'genaue'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'genaue', 'genaue', 'genaue', 'genauen'],
          [Case.Genitiv, 'genauen', 'genauen', 'genauen', 'genauen'],
          [Case.Dativ, 'genauen', 'genauen', 'genauen', 'genauen'],
          [Case.Akkusativ, 'genauen', 'genaue', 'genaue', 'genauen'],
        ],
      },
      {
        degree: AdjectiveDegree.Positiv,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'genauer', 'genaue', 'genaues', 'genauen'],
          [Case.Genitiv, 'genauen', 'genauen', 'genauen', 'genauen'],
          [Case.Dativ, 'genauen', 'genauen', 'genauen', 'genauen'],
          [Case.Akkusativ, 'genauen', 'genaue', 'genaues', 'genauen'],
        ],
      },
      {
        degree: AdjectiveDegree.Komparativ,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'genauerer', 'genauere', 'genaueres', 'genauere'],
          [Case.Genitiv, 'genaueren', 'genauerer', 'genaueren', 'genauerer'],
          [Case.Dativ, 'genauerem', 'genauerer', 'genauerem', 'genaueren'],
          [Case.Akkusativ, 'genaueren', 'genauere', 'genaueres', 'genauere'],
        ],
      },
      {
        degree: AdjectiveDegree.Komparativ,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'genauere', 'genauere', 'genauere', 'genaueren'],
          [Case.Genitiv, 'genaueren', 'genaueren', 'genaueren', 'genaueren'],
          [Case.Dativ, 'genaueren', 'genaueren', 'genaueren', 'genaueren'],
          [Case.Akkusativ, 'genaueren', 'genauere', 'genauere', 'genaueren'],
        ],
      },
      {
        degree: AdjectiveDegree.Komparativ,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [Case.Nominativ, 'genauerer', 'genauere', 'genaueres', 'genaueren'],
          [Case.Genitiv, 'genaueren', 'genaueren', 'genaueren', 'genaueren'],
          [Case.Dativ, 'genaueren', 'genaueren', 'genaueren', 'genaueren'],
          [Case.Akkusativ, 'genaueren', 'genauere', 'genaueres', 'genaueren'],
        ],
      },
      {
        degree: AdjectiveDegree.Superlativ,
        inflection: AdjectiveInflection.Strong,
        values: [
          [Case.Nominativ, 'genauster/genauester', 'genauste/genaueste', 'genaustes/genauestes', 'genauste/genaueste'],
          [
            Case.Genitiv,
            'genausten/genauesten',
            'genauster/genauester',
            'genausten/genauesten',
            'genauster/genauester',
          ],
          [Case.Dativ, 'genaustem/genauestem', 'genauster/genauester', 'genaustem/genauestem', 'genausten/genauesten'],
          [Case.Akkusativ, 'genausten/genauesten', 'genauste/genaueste', 'genaustes/genauestes', 'genauste/genaueste'],
        ],
      },
      {
        degree: AdjectiveDegree.Superlativ,
        inflection: AdjectiveInflection.Weak,
        values: [
          [Case.Nominativ, 'genauste/genaueste', 'genauste/genaueste', 'genauste/genaueste', 'genausten/genauesten'],
          [
            Case.Genitiv,
            'genausten/genauesten',
            'genausten/genauesten',
            'genausten/genauesten',
            'genausten/genauesten',
          ],
          [Case.Dativ, 'genausten/genauesten', 'genausten/genauesten', 'genausten/genauesten', 'genausten/genauesten'],
          [Case.Akkusativ, 'genausten/genauesten', 'genauste/genaueste', 'genauste/genaueste', 'genausten/genauesten'],
        ],
      },
      {
        degree: AdjectiveDegree.Superlativ,
        inflection: AdjectiveInflection.Mixed,
        values: [
          [
            Case.Nominativ,
            'genauster/genauester',
            'genauste/genaueste',
            'genaustes/genauestes',
            'genausten/genauesten',
          ],
          [
            Case.Genitiv,
            'genausten/genauesten',
            'genausten/genauesten',
            'genausten/genauesten',
            'genausten/genauesten',
          ],
          [Case.Dativ, 'genausten/genauesten', 'genausten/genauesten', 'genausten/genauesten', 'genausten/genauesten'],
          [
            Case.Akkusativ,
            'genausten/genauesten',
            'genauste/genaueste',
            'genaustes/genauestes',
            'genausten/genauesten',
          ],
        ],
      },
    ],
  },
];
