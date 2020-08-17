import { AccountConfiguration } from './AccountConfiguration';

export interface AccountResponse {
  id: string;
  name: string;
  createdAt: Date;
}

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

  toResponse(): AccountResponse {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
    };
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
