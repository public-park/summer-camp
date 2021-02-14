import { ActionType, WorkspaceViewAction, NotificationAction } from './Action';

export type WorkspaceView =
  | 'PHONE_VIEW'
  | 'SETUP_VIEW'
  | 'CALL_HISTORY_VIEW'
  | 'AUDIO_DEVICES_VIEW'
  | 'CONNECT_VIEW'
  | 'USER_LIST_VIEW'
  | 'USER_SETUP_VIEW';

export const setView = (view: WorkspaceView): WorkspaceViewAction => {
  return {
    type: ActionType.WORKSPACE_VIEW,
    payload: { view: view },
  };
};

export const setNotification = (isVisible: boolean, text?: string): NotificationAction => {
  return {
    type: ActionType.WORKSPACE_NOTIFICATION,
    payload: {
      isVisible: isVisible,
      text: text,
    },
  };
};
