import produce from 'immer';
import { ActivityAction, ReadyAction, UserAction, UserActionType } from '../actions/UserAction';
import { DefaultUserStore } from '../store/DefaultUserStore';
import { UserStore } from '../store/UserStore';

const isActivityAction = (action: UserAction): action is ActivityAction => {
  return action.type === UserActionType.ACTIVITY_CHANGE;
};

const isReadyAction = (action: UserAction): action is ReadyAction => {
  return action.type === UserActionType.READY;
};

const user = (state: UserStore = DefaultUserStore, action: UserAction): UserStore => {
  return produce(state, (draft) => {
    if (isActivityAction(action)) {
      draft.activity = action.payload;
    }

    if (isReadyAction(action)) {
      return action.payload;
    }
  });
};

export default user;
