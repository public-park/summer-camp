import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';
import React from 'react';

export const ExitSetupButton = (props: any) => {
  return (
    <IconButton {...props} aria-label="xxx">
      <SvgIcon style={{ width: '40px' }}>
        <svg width="28" height="20">
          <path d="M26 8H6.8l4.62-4.62c.394-.394.58-.864.58-1.38 0-.984-.813-2-2-2-.531 0-.994.193-1.38.58L.662 8.538C.334 8.866 0 9.271 0 10s.279 1.08.646 1.447L8.62 19.42c.386.387.849.58 1.38.58 1.188 0 2-1.016 2-2 0-.516-.186-.986-.58-1.38L6.8 12H26a2 2 0 000-4z" />
        </svg>
      </SvgIcon>
    </IconButton>
  );
};
