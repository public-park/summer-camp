export const UserRequestSchema = {
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' } },
    activity: { type: 'string' },
  },
  additionalProperties: false,
};
