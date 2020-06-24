export const UserUpdateRequestSchema = {
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' } },
    activity: { type: 'string' },
    role: { type: 'string' },
  },
  additionalProperties: false,
};
