import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';

interface AccountSetupFormInputProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  default: string;
  validator: RegExp;
  onUpdate: (value: string) => void;
  onFocus: () => void;
}

export const AccountSetupFormInput = (props: AccountSetupFormInputProps) => {
  const [value, setValue] = useState(props.default);
  const [isValid, setIsValid] = useState(false);

  const onChange = (value: string) => {
    setValue(value);

    props.onUpdate(value);
  };

  useEffect(() => {
    setIsValid(props.validator.test(value));
  }, [value]);

  return (
    <TextField
      style={{ marginBottom: '20px' }}
      fullWidth
      type={props.type}
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={() => props.onFocus()}
      id={props.id}
      label={props.label}
      error={isValid === false}
      helperText={isValid === false && `Incorrect entry`}
    />
  );
};
