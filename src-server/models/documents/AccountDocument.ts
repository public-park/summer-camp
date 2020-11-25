import { AccountConfigurationDocument } from './AccountConfigurationDocument';

export interface AccountDocument {
  id: string;
  name: string;
  createdAt: Date;
  configuration?: AccountConfigurationDocument;
}
