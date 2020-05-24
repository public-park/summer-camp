import { useState, useEffect } from 'react';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';

export const useValidateLocalConfiguration = (configuration: AccountConfiguration) => {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!configuration.outbound) {
      return;
    }

    if (!configuration.outbound.isEnabled && !configuration.inbound.isEnabled) {
      setError('Either outbound or inbound has to be active');
      setIsValid(false);
      return;
    }

    if (configuration.outbound.isEnabled) {
      if (!configuration.outbound.mode) {
        setError('Please select mode via caller id or number');
        setIsValid(false);
        return;
      }

      if (configuration.outbound.mode === 'internal-caller-id' && !configuration.outbound.phoneNumber) {
        setError('Please select a phoneNumber for outbound');
        setIsValid(false);
        return;
      }

      if (configuration.outbound.mode === 'external-caller-id' && !configuration.outbound.phoneNumber) {
        setError('Please select a callerId for outbound');
        setIsValid(false);
        return;
      }
    }

    if (configuration.inbound.isEnabled) {
      if (!configuration.inbound.phoneNumber) {
        setError('Please select a phoneNumber for inbound');
        setIsValid(false);
        return;
      }
    }

    setIsValid(true);
    setError('');
  }, [configuration]);

  return { isValid, error };
};
