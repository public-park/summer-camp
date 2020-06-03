import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

export const HistoryButton = (props: any) => {
  return (
    <IconButton {...props} aria-label="configuration">
      <SvgIcon>
        <svg width="24" height="24">
          <g fill="none" fillRule="evenodd">
            <path
              d="M6.112 20.795c1.773 1.382 4 2.205 6.42 2.205C18.311 23 23 18.299 23 12.5S18.313 2 12.531 2C9.011 2 5.898 3.742 4 6.413"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path stroke="white" strokeWidth="2" strokeLinecap="round" d="M12 6v8.168L16 17" />
            <path
              d="M1.11 8.3a.435.435 0 00.5.625l7.564-1.822a.503.503 0 00.196-.097c.206-.164.247-.454.093-.647L5.337 1.201a.425.425 0 00-.164-.125.492.492 0 00-.625.244L1.109 8.3z"
              fill="white"
              fillRule="nonzero"
            />
          </g>
        </svg>
      </SvgIcon>
    </IconButton>
  );
};
