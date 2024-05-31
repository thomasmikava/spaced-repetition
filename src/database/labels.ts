import { Label } from './types';

export const labels: Label[] = [{ id: 1, name: 'Modal verbs' }];

interface LabelLocalized {
  lang: string;
  labelId: number;
  name: string;
}

export const labelsLocalized: LabelLocalized[] = [{ lang: 'de', labelId: 1, name: 'Modalverb' }];

export const LabelMapper = {
  ModalVerb: 1,
};
