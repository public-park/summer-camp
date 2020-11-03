import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

export const UsersButton = (props: any) => {
  return (
    <IconButton {...props} aria-label="users">
      <SvgIcon>
        <svg width="24" height="24">
          <path
            d="M15.804 13.46c2.082-1.28 3.477-3.572 3.477-6.188C19.281 3.262 16.015 0 12 0S4.719 3.262 4.719 7.272c0 2.616 1.395 4.907 3.477 6.189-4.495 1.007-7.65 3.758-7.65 7.087C.546 23.273 7.746 24 12 24c4.254 0 11.454-.727 11.454-3.452 0-3.33-3.155-6.08-7.65-7.087zM6.219 7.273C6.219 4.089 8.812 1.5 12 1.5c3.188 0 5.781 2.59 5.781 5.772 0 3.183-2.593 5.771-5.781 5.771-3.188 0-5.781-2.588-5.781-5.771zM12 22.5c-6.115 0-9.775-1.29-9.954-1.957.005-3.308 4.469-6 9.954-6s9.948 2.691 9.954 6C21.78 21.208 18.119 22.5 12 22.5z"
            fill="#FFF"
            fillRule="nonzero"
          />
        </svg>
      </SvgIcon>
    </IconButton>
  );
};
