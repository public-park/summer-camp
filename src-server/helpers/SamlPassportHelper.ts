import * as fs from 'fs';
import { toPassportConfig, MetadataReader } from 'passport-saml-metadata';

import * as PassportSaml from 'passport-saml';
import { Profile, VerifiedCallback } from 'passport-saml';
import { RequestWithAccount } from '../requests/RequestWithAccount';

export interface RequestWithProfile extends RequestWithAccount {
  profile: Profile;
}

const verifyProfile = (req: RequestWithProfile, profile: Profile, done: VerifiedCallback) => {
  req.profile = profile;

  return done(null, { ...profile });
};

export const getStrategy = (file: string) => {
  const reader = new MetadataReader(fs.readFileSync(file, 'utf8'));
  const config = {
    ...toPassportConfig(reader),
    validateInResponseTo: true,
    disableRequestedAuthnContext: true,
    passReqToCallback: true,
  };
  return new PassportSaml.Strategy(config, verifyProfile);
};
