import { FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';

interface RegisterFormInputProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  default: string;
  validator: (value: string) => { isValid: boolean; text: string };
  onUpdate: (value: string) => void;
  onFocus: () => void;
}

export const RegisterFormInput = (props: RegisterFormInputProps) => {
  const [value, setValue] = useState(props.default);
  const [validation, setValidation] = useState({ isValid: false, text: '' });

  const onChange = (value: string) => {
    setValue(value);

    props.onUpdate(value);
  };

  useEffect(() => {
    const result = props.validator(value);

    setValidation(result);
  }, [value]);

  return (
    <div>
      <FormControl fullWidth variant="outlined">
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
          error={validation.isValid === false}
          helperText={validation.text}
          variant="outlined"
        />
      </FormControl>
    </div>
  );
};
