export const AccountConfigurationRequestSchema = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    secret: { type: 'string' },
    accountSid: { type: 'string' },
    applicationSid: { type: 'string' },
    inbound: {
      type: 'object',
      properties: {
        isEnabled: { type: 'boolean' },
        phoneNumber: { type: 'string' },
      },
      required: ['isEnabled'],
      additionalProperties: false,
    },
    outbound: {
      type: 'object',
      properties: {
        isEnabled: { type: 'boolean' },
        mode: { enum: ['internal-caller-id', 'external-caller-id'] },
        phoneNumber: { type: 'string' },
      },
      required: ['isEnabled'],
      additionalProperties: false,
    },
  },
  required: ['key', 'accountSid', 'inbound', 'outbound'],
  additionalProperties: false,
};
