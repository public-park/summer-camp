import { ActionType } from './ActionType';

export type ApplicationView = 'PHONE' | 'SETUP';

export const setView = (view: ApplicationView) => {
  return {
    type: ActionType.APPLICATION_VIEW,
    payload: { view: view },
  };
};
