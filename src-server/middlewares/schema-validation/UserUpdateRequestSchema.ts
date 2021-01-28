export const UserUpdateRequestSchema = {
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' } },
    activity: { type: 'string' },
    role: { type: 'string' },
    configuration: {
      type: 'object',
      properties: {
        phone: {
          type: 'object',
          properties: {
            constraints: {
              type: 'object',
              properties: {
                echoCancellation: { type: 'boolean' },
                autoGainControl: { type: 'boolean' },
                noiseSuppression: { type: 'boolean' },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
        additionalProperties: false,
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};
