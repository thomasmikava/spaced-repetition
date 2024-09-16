import type {
  UserCardTypeSettingsDTO,
  UserGlobalPreferencesDTO,
  UserLangCardGroupSettingsDTO,
  UserLangPreferencesDTO,
  UserPreferencesDTO,
} from '../api/controllers/users/users.schema';

type LangCardGroupPreferences = Required<UserLangCardGroupSettingsDTO>;

interface CardTypePreferences {
  hideGroups: boolean;
  askNonStandardVariants: boolean;
  groupOrder?: string[];
  groupSettings: Record<string, LangCardGroupPreferences>;
}

export type Preferences = Required<Omit<UserGlobalPreferencesDTO, 'cardTypeSettings'>> & {
  cardTypeSettings: Record<string, CardTypePreferences>;
};

const groupSettings: CardTypePreferences['groupSettings'] = new Proxy(
  {},
  { get: (): LangCardGroupPreferences => ({ hideGroup: false, askNonStandardVariants: true }) },
);

const cardTypeSettings: Preferences['cardTypeSettings'] = new Proxy(
  {},
  {
    get: (): CardTypePreferences => ({
      hideGroups: false,
      askNonStandardVariants: true,
      groupOrder: undefined,
      groupSettings,
    }),
  },
);

export const defaultPreferences: Preferences = {
  autoSubmitCorrectAnswers: false,
  testTypingTranslation: false,
  askNonStandardVariants: true,
  translationAtBottom: false,
  hideRegularTranslationIfAdvanced: false,
  cardTypeSettings,
};

export const calculatePreferences = (preferences: UserPreferencesDTO | null, lang: string): Preferences => {
  if (!preferences) {
    return defaultPreferences;
  }

  const langPref = preferences.perLang[lang];
  const globalPref = preferences.global;

  return {
    autoSubmitCorrectAnswers:
      langPref?.autoSubmitCorrectAnswers ??
      globalPref.autoSubmitCorrectAnswers ??
      defaultPreferences.autoSubmitCorrectAnswers,
    testTypingTranslation:
      langPref?.testTypingTranslation ?? globalPref.testTypingTranslation ?? defaultPreferences.testTypingTranslation,
    askNonStandardVariants:
      langPref?.askNonStandardVariants ??
      globalPref.askNonStandardVariants ??
      defaultPreferences.askNonStandardVariants,
    translationAtBottom:
      langPref?.translationAtBottom ?? globalPref.translationAtBottom ?? defaultPreferences.translationAtBottom,
    hideRegularTranslationIfAdvanced:
      langPref?.hideRegularTranslationIfAdvanced ??
      globalPref.hideRegularTranslationIfAdvanced ??
      defaultPreferences.hideRegularTranslationIfAdvanced,
    cardTypeSettings: calculateCardTypePreferences(globalPref, langPref),
  };
};

const calculateCardTypePreferences = (
  globalPref: UserGlobalPreferencesDTO,
  langPref: UserLangPreferencesDTO | undefined,
): Preferences['cardTypeSettings'] => {
  const cachedPreferences: Record<string, CardTypePreferences | undefined> = {};
  return new Proxy(
    {},
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (_target, prop): CardTypePreferences => {
        const cardType = prop as string;
        const cached = cachedPreferences[cardType];
        if (cached) return cached;
        const langCardTypePref = langPref?.cardTypeSettings?.[cardType];
        const def = defaultPreferences.cardTypeSettings[cardType];
        return {
          hideGroups: langCardTypePref?.hideGroups ?? def.hideGroups,
          askNonStandardVariants:
            langCardTypePref?.askNonStandardVariants ??
            langPref?.askNonStandardVariants ??
            globalPref.askNonStandardVariants ??
            def.askNonStandardVariants,
          groupOrder: langCardTypePref?.groupOrder ?? def.groupOrder,
          groupSettings: calculateGroupSettings(globalPref, langPref, langCardTypePref),
        };
      },
    },
  );
};

const calculateGroupSettings = (
  globalPref: UserGlobalPreferencesDTO,
  langPref: UserLangPreferencesDTO | undefined,
  langCardTypePref: UserCardTypeSettingsDTO | undefined,
): CardTypePreferences['groupSettings'] => {
  const cachedGroupSettings: Record<string, LangCardGroupPreferences | undefined> = {};
  return new Proxy(
    {},
    {
      get: (_target, prop): LangCardGroupPreferences => {
        const group = prop as string;
        const cached = cachedGroupSettings[group];
        if (cached) return cached;
        const langGroupPref = langCardTypePref?.groupSettings?.[group];
        const defGroupSettings = groupSettings[group];
        return {
          hideGroup: langGroupPref?.hideGroup ?? langCardTypePref?.hideGroups ?? defGroupSettings.hideGroup,
          askNonStandardVariants:
            langGroupPref?.askNonStandardVariants ??
            langCardTypePref?.askNonStandardVariants ??
            langPref?.askNonStandardVariants ??
            globalPref.askNonStandardVariants ??
            defGroupSettings.hideGroup,
        };
      },
    },
  );
};
