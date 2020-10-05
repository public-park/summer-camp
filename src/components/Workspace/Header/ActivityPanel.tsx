import { useSelector } from 'react-redux';
import { selectActivity } from '../../../store/Store';
import { UserActivity } from '../../../models/UserActivity';
import { FormControlLabel, withStyles } from '@material-ui/core';
import React, { useContext } from 'react';
import { ApplicationContext } from '../../../context/ApplicationContext';
import Switch from '@material-ui/core/Switch';

export const ActivityPanel = () => {
  const activity = useSelector(selectActivity);

  const { user } = useContext(ApplicationContext);

  const ActivitySwitch = withStyles({
    switchBase: {
      color: '#e0e0e0',
      '&$checked': {
        color: '#43C16E',
      },
      '&$checked + $track': {
        backgroundColor: '#f5f5f5',
      },
    },
    checked: {},
    track: {},
  })(Switch);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      user.activity = UserActivity.WaitingForWork;
    } else {
      user.activity = UserActivity.Away;
    }

    console.log(`set state to: ${user.activity}`);
  };

  return (
    <FormControlLabel
      control={
        <ActivitySwitch checked={UserActivity.WaitingForWork === activity} onChange={handleToggle} name="checkedA" />
      }
      label="Available"
    />
  );
};
