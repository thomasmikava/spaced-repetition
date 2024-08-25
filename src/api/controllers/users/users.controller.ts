import { apiRequest } from '../../api';
import type { IRequest } from '../../request';
import type { GetUserPreferencesResDTO, ReplaceUserPreferencesReqDTO } from './users.schema';

class UserController {
  constructor(private readonly request: IRequest) {}

  replacePreferences = (data: ReplaceUserPreferencesReqDTO): Promise<void> => {
    return this.request.patch('/user/preferences', data);
  };

  getPreferences = (): Promise<GetUserPreferencesResDTO> => {
    return this.request.get('/user/preferences');
  };
}

export const userController = new UserController(apiRequest);
