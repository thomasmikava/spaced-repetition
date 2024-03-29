import { apiRequest } from '../api';
import type { IRequest } from '../request';
import type {
  LoginReqDTO,
  LoginResDTO,
  RenewAccessTokenReqDTO,
  RenewAccessTokenResDTO,
  RevokeTokensReqDTO,
} from './auth.schema';

class AuthController {
  constructor(private readonly request: IRequest) {}

  login = (args: LoginReqDTO): Promise<LoginResDTO> => {
    return this.request.post('auth/login', args, {
      headers: { Authorization: undefined },
    });
  };

  renewAccessToken = (args: RenewAccessTokenReqDTO): Promise<RenewAccessTokenResDTO> => {
    return this.request.post('auth/renew-token', args, {
      headers: { Authorization: undefined },
    });
  };

  revokeTokens = (args: RevokeTokensReqDTO): Promise<void> => {
    return this.request.post('auth/revoke-tokens', args, {
      headers: { Authorization: undefined },
    });
  };
}

export const authController = new AuthController(apiRequest);
