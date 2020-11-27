import { AccountConfiguration } from './AccountConfiguration';
import { AccountDocument } from './documents/AccountDocument';

export class Account {
  id: string;
  name: string;
  configuration: AccountConfiguration | undefined;
  createdAt: Date;

  constructor(
    id: string,
    name: string,
    configuration: AccountConfiguration | undefined = undefined,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.configuration = configuration;
    this.createdAt = createdAt;
  }

  toDocument(): AccountDocument {
    const payload: AccountDocument = {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
    };

    if (this.configuration) {
      payload.configuration = {
        key: this.configuration.key,
        secret: this.configuration.secret,
        accountSid: this.configuration.accountSid,
        inbound: {
          ...this.configuration.inbound,
        },
        outbound: {
          ...this.configuration.outbound,
        },
      };

      if (payload.configuration.outbound.isEnabled === false) {
        delete payload.configuration.outbound.phoneNumber;
        delete payload.configuration.outbound.mode;
      }

      if (payload.configuration.inbound.isEnabled === false) {
        delete payload.configuration.inbound.phoneNumber;
      }
    }

    return payload;
  }

  hasConfiguration() {
    return this.configuration !== undefined;
  }

  hasValidConfiguration() {
    if (!this.configuration?.key || !this.configuration?.secret || !this.configuration?.accountSid) {
      return false;
    }

    return this.configuration?.inbound.isEnabled || this.configuration?.outbound.isEnabled;
  }

  getConfigurationWithoutSecret() {
    if (!this.configuration) {
      return;
    }

    const payload = {
      key: this.configuration.key,
      accountSid: this.configuration.accountSid,
      inbound: {
        ...this.configuration.inbound,
      },
      outbound: {
        ...this.configuration.outbound,
      },
    };

    return payload;
  }
}
