import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

export const PhoneButton = (props: any) => {
  return (
    <IconButton {...props} aria-label="configuration">
      <SvgIcon>
        <svg width="22" height="22">
          <path
            d="M4.4 9.533c1.711 3.423 4.644 6.234 8.067 8.067l2.689-2.689c.366-.367.855-.489 1.222-.244 1.344.489 2.81.733 4.4.733.733 0 1.222.489 1.222 1.222v4.156C22 21.51 21.511 22 20.778 22 9.288 22 0 12.711 0 1.222 0 .49.489 0 1.222 0H5.5c.733 0 1.222.489 1.222 1.222 0 1.467.245 2.934.734 4.4.122.367 0 .856-.245 1.222L4.4 9.534z"
            fill="#FFF"
            fillRule="nonzero"
          />
        </svg>
      </SvgIcon>
    </IconButton>
  );
};
