import { useState, useEffect } from 'react';
import { AccountConfiguration } from '../../../../models/AccountConfiguration';

export const useValidateLocalConfiguration = (configuration: AccountConfiguration) => {
  const [exception, setException] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!configuration.outbound) {
      return;
    }

    if (!configuration.outbound.isEnabled && !configuration.inbound.isEnabled) {
      setException('Either outbound or inbound has to be active');
      setIsValid(false);
      return;
    }

    if (configuration.outbound.isEnabled) {
      if (!configuration.outbound.mode) {
        setException('Please select mode via caller id or number');
        setIsValid(false);
        return;
      }

      if (configuration.outbound.mode === 'internal-caller-id' && !configuration.outbound.phoneNumber) {
        setException('Please select a phoneNumber for outbound');
        setIsValid(false);
        return;
      }

      if (configuration.outbound.mode === 'external-caller-id' && !configuration.outbound.phoneNumber) {
        setException('Please select a callerId for outbound');
        setIsValid(false);
        return;
      }
    }

    if (configuration.inbound.isEnabled) {
      if (!configuration.inbound.phoneNumber) {
        setException('Please select a phoneNumber for inbound');
        setIsValid(false);
        return;
      }
    }

    setIsValid(true);
    setException('');
  }, [configuration]);

  return { isValid, exception };
};
