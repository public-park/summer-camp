import { AccountConfigurationDocument } from './AccountConfigurationDocument';

export interface AccountDocument {
  id: string;
  name: string;
  createdAt: string;
  configuration?: AccountConfigurationDocument;
}
