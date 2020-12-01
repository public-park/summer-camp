import { ActionType } from './ActionType';

export type ApplicationPage = 'LOGIN_PAGE' | 'LOGOUT_PAGE' | 'WORKSPACE_PAGE' | 'INIT_PAGE';

export interface PageAction {
  type: ActionType;
  payload: PageActionPayload;
}

interface PageActionPayload {
  page: ApplicationPage;
}
