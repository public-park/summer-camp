import { useSelector } from 'react-redux';
import { UserActivity } from '../../../models/UserActivity';
import { FormControlLabel, withStyles } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { ApplicationContext } from '../../../context/ApplicationContext';
import Switch from '@material-ui/core/Switch';
import { selectUser } from '../../../store/Store';

export const ActivityPanel = () => {
  const { user } = useContext(ApplicationContext);

  const { activity } = useSelector(selectUser);

  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    const activity = event.target.checked ? UserActivity.WaitingForWork : UserActivity.Away;

    await user?.setActivity(activity);

    setIsProcessing(false);
  };

  return (
    <FormControlLabel
      control={
        <ActivitySwitch
          checked={UserActivity.WaitingForWork === activity}
          onChange={handleToggle}
          name="user-activity"
        />
      }
      label="Available"
      data-activity={activity}
      className="panel"
    />
  );
};
