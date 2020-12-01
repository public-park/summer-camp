import { LocalStorageContext } from '../services/LocalStorageContext';
import { ActionType } from './ActionType';

export const onPageLoad = (context: LocalStorageContext) => {
  return {
    type: ActionType.PAGE_LOAD,
    payload: context,
  };
};
