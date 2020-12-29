import { produce } from 'immer';
import { ActionType, ApplicationAction } from '../actions/Action';
import { DefaultUserStore } from '../store/DefaultUserStore';
import { UserStore } from '../store/UserStore';

const user = (state: UserStore = DefaultUserStore, action: ApplicationAction): UserStore => {
  return produce(state, (draft) => {
    if (action.type === ActionType.USER_ACTIVITY_CHANGE) {
      draft.activity = action.payload;
    }

    if (action.type === ActionType.USER_READY) {
      return action.payload;
    }
  });
};

export default user;
