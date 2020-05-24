module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['src-server'],
  globals: {
    'ts-jest': {
      tsConfig: 'src-server/tsconfig.json'
    }
  },
 
};


