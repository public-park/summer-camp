export const UserRequestSchema = {
  type: 'object',
  properties: {
    labels: { type: 'array', items: { type: 'string' } },
    activity: { type: 'string' },
  },
  additionalProperties: false,
};
