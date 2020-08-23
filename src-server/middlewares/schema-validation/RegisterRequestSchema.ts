export const RegisterRequestSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 40 },
    password: { type: 'string', minLength: 1, maxLength: 40 },
  },
  required: ['name', 'password'],

  additionalProperties: false,
};
