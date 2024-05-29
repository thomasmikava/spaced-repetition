///

export interface LoginReqDTO {
  email: string;
  password: string;
}

export interface LoginResDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

///

export interface RegisterReqDTO {
  email: string;
  password: string;
  nickName: string;
  fullName: string;
}

export type RegisterResDTO = LoginResDTO;

///

export interface RenewAccessTokenReqDTO {
  refreshToken: string;
}

export type RenewAccessTokenResDTO = LoginResDTO;

///

export interface RevokeTokensReqDTO {
  accessToken: string;
  refreshToken: string;
}

////

export interface UserToken {
  /** Email */
  sub: string;
  userId: number;
  adminLangs: string[] | null;
}
