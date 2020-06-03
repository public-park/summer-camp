import React, { useState, useEffect, useContext } from 'react';

import produce from 'immer';
import { PhoneConfigurationContext, InitialConfiguration } from './PhoneConfigurationContext';
import { ConfiguratonViewState } from './ConfigurationViewState';
import { useValidateLocalConfiguration } from './hooks/useValidateLocalConfiguration';
import { updateConfiguration } from './services/updateConfiguration';
import { validateConfiguration } from './services/validateConfiguration';
import { ApplicationContext } from '../../../context/ApplicationContext';
import { ActionType } from '../../../actions/ActionType';
import { useDispatch } from 'react-redux';
import { fetchAccountConfiguration } from './services/fetchAccountConfiguration';

export const ConfigurationProvider = (props: any) => {
  const { user } = useContext(ApplicationContext);

  const dispatch = useDispatch();

  const [view, setView] = useState<ConfiguratonViewState>('FETCHING');

  const [isSaving, setIsSaving] = useState(false);
  const [hasError] = useState(false);

  const [configuration, setConfiguration] = useState(InitialConfiguration);

  // TODO, should return error object
  const { isValid, error } = useValidateLocalConfiguration(configuration);

  const getView = (): ConfiguratonViewState => {
    return view;
  };

  const setBaseConfiguration = (key: string, secret: string, accountSid: string) => {
    const override = produce(configuration, (draft) => {
      draft.key = key;
      draft.secret = secret;
      draft.accountSid = accountSid;
    });

    /* reset all */
    disableOutbound();
    disableInbound();

    setConfiguration(override);
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

  const save = async () => {
    dispatch({
      type: ActionType.USER_CONFIGURATION_CHANGED,
      payload: {},
    });

    return;

    setIsSaving(true);

    try {
      await updateConfiguration(user, configuration);
    } catch (error) {
      console.log(error);

      setView('FAILED');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function validate() {
      // TODO, handle exception
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

    if (getView() === 'VALIDATING') validate();
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
        console.log(error);
        setView('FAILED');
      }
    }

    init();
  }, []);

  return (
    <PhoneConfigurationContext.Provider
      value={{
        error,
        hasError,
        configuration,
        setMode,
        setBaseConfiguration,
        setInboundPhoneNumber,
        enableInbound,
        disableInbound,
        enableOutbound,
        disableOutbound,
        setOutboundPhoneNumber,
        save,
        getView,
        setView,
        isValid,
        isSaving,
        setIsSaving,
      }}
    >
      {props.children}
    </PhoneConfigurationContext.Provider>
  );
};
