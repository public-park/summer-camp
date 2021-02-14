import { withStyles, Badge, Avatar } from '@material-ui/core';
import React from 'react';
import { UserPresenceDocument } from '../../../models/documents/UserDocument';

export interface UserCardProps {
  user: UserPresenceDocument;
}

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#e01c0d',
    color: '#e01c0d',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      content: '""',
    },
  },
}))(Badge);

const StyledBadgeIsOnline = withStyles((theme) => ({
  badge: {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      content: '""',
    },
  },
}))(Badge);

const getStatusText = (user: UserPresenceDocument) => {
  if (user.call) {
    return 'on a call';
  }

  return user.isAvailable ? 'available' : 'unavailable';
};

export const UserItem = (props: UserCardProps) => {
  const { user } = props;

  return (
    <div className="item">
      <div>
        <div className="avatar">
          {user.isOnline ? (
            <StyledBadgeIsOnline
              overlap="circle"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              variant="dot"
            >
              <Avatar src={user.profileImageUrl} alt={user.name}>
                {user.name?.toUpperCase().substr(0, 1)}
              </Avatar>
            </StyledBadgeIsOnline>
          ) : (
            <StyledBadge
              overlap="circle"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              variant="dot"
            >
              <Avatar src={user.profileImageUrl} alt={user.name}>
                {user.name?.toUpperCase().substr(0, 1)}
              </Avatar>
            </StyledBadge>
          )}
        </div>

        <div className="detail">
          <h3> {user.name}</h3>
          <span className="status">Status: {getStatusText(user)}</span>
        </div>
      </div>
    </div>
  );
};
