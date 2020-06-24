export const UserCreateRequestSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    password: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    activity: { type: 'string' },
    role: { type: 'string' },
  },
  required: ['name', 'password'],
  additionalProperties: false,
};
