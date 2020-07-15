import { ActionType } from './ActionType';

export type WorkspaceView =
  | 'PHONE_VIEW'
  | 'SETUP_VIEW'
  | 'CALL_HISTORY_VIEW'
  | 'AUDIO_DEVICE_VIEW'
  | 'FETCH_CONFIGURATION_VIEW';

export interface WorkspaceViewAction {
  type: ActionType;
  payload: WorkspaceViewActionPayload;
}

interface WorkspaceViewActionPayload {
  view: WorkspaceView;
}

export const setWorkspaceView = (view: WorkspaceView): WorkspaceViewAction => {
  return {
    type: ActionType.WORKSPACE_VIEW,
    payload: { view: view },
  };
};
