import { z } from 'zod';

export interface UserGlobalPreferencesDTO {
  autoSubmitCorrectAnswers?: boolean;
  testTypingTranslation?: boolean;
  askNonStandardVariants?: boolean;
}

const UserGlobalPreferences = z.object({
  autoSubmitCorrectAnswers: z.boolean().optional(),
  testTypingTranslation: z.boolean().optional(),
  askNonStandardVariants: z.boolean().optional(),
});

export interface UserPreferencesDTO {
  global: UserGlobalPreferencesDTO;
  perLang: Record<string, UserGlobalPreferencesDTO | undefined>;
}

const UserPreferences = z.object({
  global: UserGlobalPreferences,
  perLang: z.record(UserGlobalPreferences),
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
