import React, { useState, useEffect, useContext } from 'react';

import produce from 'immer';
import { ConfiguratonViewState } from './ConfigurationViewState';
import { useValidateLocalConfiguration } from './hooks/useValidateLocalConfiguration';
import { updateConfiguration } from './services/updateConfiguration';
import { validateConfiguration } from './services/validateConfiguration';
import { fetchAccountConfiguration } from './services/fetchAccountConfiguration';
import { DefaultConfiguration } from './DefaultConfiguration';
import { ConfigurationContext } from './ConfigurationContext';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { UserEvent } from '../../../models/UserEvent';

export const ConfigurationContextProvider = (props: any) => {
  const { user } = useContext(ApplicationContext);

  const [view, setView] = useState<ConfiguratonViewState>('FETCHING');
  const [exception, setException] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const [configuration, setConfiguration] = useState(DefaultConfiguration);
  const [isValidBaseConfiguration, setIsValidBaseConfiguration] = useState<undefined | boolean>(undefined);

  const localValidation = useValidateLocalConfiguration(configuration);

  const getView = (): ConfiguratonViewState => {
    return view;
  };

  const enableOutbound = () => {
    const override = produce(configuration, (draft) => {
      draft.outbound.isEnabled = true;
    });

    setConfiguration(override);
  };

  const disableOutbound = () => {
    const override = produce(configuration, (draft) => {
      draft.outbound.isEnabled = false;
      draft.outbound.phoneNumber = undefined;
      draft.outbound.mode = undefined;
    });

    setConfiguration(override);
  };

  const enableInbound = () => {
    const override = produce(configuration, (draft) => {
      draft.inbound.isEnabled = true;
    });

    setConfiguration(override);
  };

  const disableInbound = () => {
    const override = produce(configuration, (draft) => {
      draft.inbound.isEnabled = false;
      draft.inbound.phoneNumber = undefined;
    });

    setConfiguration(override);
  };

  const setInboundPhoneNumber = (phoneNumber: string) => {
    const override = produce(configuration, (draft) => {
      draft.inbound.phoneNumber = phoneNumber;
    });

    setConfiguration(override);
  };

  const setMode = (mode: string) => {
    const override = produce(configuration, (draft) => {
      draft.outbound.mode = mode;
      draft.outbound.phoneNumber = undefined;
    });

    setConfiguration(override);
  };

  const setOutboundPhoneNumber = (phoneNumber: string) => {
    const override = produce(configuration, (draft) => {
      draft.outbound.phoneNumber = phoneNumber;
    });

    setConfiguration(override);
  };

  const saveBaseConfiguration = async (key: string, secret: string, accountSid: string) => {
    setIsSaving(true);

    const base = {
      ...DefaultConfiguration,
      key: key,
      secret: secret,
      accountSid: accountSid,
    };

    setConfiguration(base);

    const result = await validateConfiguration(user, base);

    if (result.isValid) {
      try {
        await updateConfiguration(user, base);

        setConfiguration(base);

        setView('PHONE_SETUP');
      } catch (error) {
        setException('server error please check logs');
        setView('FAILED');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsValidBaseConfiguration(false);
      setIsSaving(false);
    }
  };

  const saveAll = async () => {
    setIsSaving(true);

    try {
      await updateConfiguration(user, configuration);

      user.send(UserEvent.Configuration, null);
    } catch (error) {
      console.error(error);
      setException('server error please check logs');
      setView('FAILED');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function validate() {
      const validationResult = await validateConfiguration(user, configuration);

      if (validationResult.isValid) {
        setView('PHONE_SETUP');
        return;
      }

      if (!validationResult.isValid && validationResult.code === 'PHONE_NUMBER_NOT_ON_ACCOUNT') {
        disableInbound();
        disableOutbound();

        setView('PHONE_SETUP');
        return;
      }

      if (!validationResult.isValid && validationResult.code === 'CALLER_ID_NOT_ON_ACCOUNT') {
        disableOutbound();

        setView('PHONE_SETUP');
        return;
      }

      setView('BASIC_SETUP');
    }

    if (getView() === 'VALIDATING') {
      validate();
    }
  }, [view]);

  useEffect(() => {
    async function init() {
      try {
        setView('FETCHING');

        const configuration = await fetchAccountConfiguration(user);

        if (!configuration) {
          setView('BASIC_SETUP');
        } else {
          setConfiguration(configuration);
          setView('VALIDATING');
        }
      } catch (error) {
        console.error(error);
        setView('FAILED');
      }
    }

    init();
  }, []);

  return (
    <ConfigurationContext.Provider
      value={{
        exception,
        setException,
        configuration,
        isValidBaseConfiguration,
        setMode,
        setInboundPhoneNumber,
        enableInbound,
        disableInbound,
        enableOutbound,
        disableOutbound,
        setOutboundPhoneNumber,
        saveAll,
        saveBaseConfiguration,
        getView,
        setView,
        localValidation,
        isSaving,
      }}
    >
      {props.children}
    </ConfigurationContext.Provider>
  );
};
