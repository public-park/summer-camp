import React from 'react';
import { MenuItem, Select } from '@material-ui/core';

export const PhoneNumberSelect = (props: any) => {
  const handleChange = (event: any) => {
    props.setValue(event.target.value);
  };

  return (
    <div style={{ margin: '5px 0px 5px 0px' }}>
      <Select fullWidth value={props.value} onChange={handleChange}>
        <MenuItem key="please_select" value="">
          Please Select
        </MenuItem>
        {props.items.map((item: any, index: number) => {
          return (
            <MenuItem key={index} value={`${item.phoneNumber}`}>
              {`${item.phoneNumber} - ${item.friendlyName}`}
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};
