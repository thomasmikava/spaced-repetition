import { z } from 'zod';

export interface UserGlobalPreferencesDTO {
  autoSubmitCorrectAnswers?: boolean;
  testTypingTranslation?: boolean;
  askNonStandardVariants?: boolean;
  translationAtBottom?: boolean;
  hideRegularTranslationIfAdvanced?: boolean;
}

interface UserLangCardGroupSettingsDTO {
  hideGroup?: boolean;
  askNonStandardVariants?: boolean;
}

export interface UserCardTypeSettingsDTO {
  hideGroups?: boolean;
  askNonStandardVariants?: boolean;
  groupOrder?: string[];
  groupSettings?: Record<string, UserLangCardGroupSettingsDTO | undefined>;
}

export interface UserLangPreferencesDTO extends UserGlobalPreferencesDTO {
  cardTypeSettings?: Record<string, UserCardTypeSettingsDTO | undefined>;
}

const UserGlobalPreferences = z.object({
  autoSubmitCorrectAnswers: z.boolean().optional(),
  testTypingTranslation: z.boolean().optional(),
  askNonStandardVariants: z.boolean().optional(),
  translationAtBottom: z.boolean().optional(),
  hideRegularTranslationIfAdvanced: z.boolean().optional(),
});

const UserLangCardGroupSettings = z.object({
  hideGroup: z.boolean().optional(),
  askNonStandardVariants: z.boolean().optional(),
});

const UserCardTypeSettings = UserGlobalPreferences.extend({
  hideGroups: z.boolean().optional(),
  askNonStandardVariants: z.boolean().optional(),
  groupOrder: z.array(z.string()).optional(),
  groupSettings: z.record(UserLangCardGroupSettings).optional(),
});

const UserLangPreferences = UserGlobalPreferences.extend({
  cardTypeSettings: z.record(UserCardTypeSettings).optional(),
});

export interface UserPreferencesDTO {
  global: UserGlobalPreferencesDTO;
  perLang: Record<string, UserLangPreferencesDTO | undefined>;
}

const UserPreferences = z.object({
  global: UserGlobalPreferences,
  perLang: z.record(UserLangPreferences),
});

///

export const ReplaceUserPreferencesReq = UserPreferences;
export type ReplaceUserPreferencesReqDTO = UserPreferencesDTO;

///

export const GetUserPreferencesRes = z.object({
  result: UserPreferences.nullable(),
});
export type GetUserPreferencesResDTO = {
  result: UserPreferencesDTO | null;
};
