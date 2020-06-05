import { AccountConfiguration } from './AccountConfiguration';

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

  toApiResponse(): any {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
