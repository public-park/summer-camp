import { ActionType } from './ActionType';

export interface NotificationShowAction {
  type: ActionType;
  payload: string;
}

export interface NotificationHideAction {
  type: ActionType;
}

export const showNotification = (text: string): NotificationShowAction => {
  return {
    type: ActionType.WORKSPACE_NOTIFICATION_SHOW,
    payload: text,
  };
};

export const hideNotification = (): NotificationHideAction => {
  return {
    type: ActionType.WORKSPACE_NOTIFICATION_HIDE,
  };
};
