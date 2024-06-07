module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        'react-native/no-inline-styles': 'off',
      },
    },
  ],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-var': 'error',
    'react/no-unstable-nested-components': [
      'off',
      {
        allowAsProps: true,
      },
    ],
  },
};
