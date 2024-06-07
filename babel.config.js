module.exports = {
  presets: [
    [
      'module:metro-react-native-babel-preset',
      {useTransformReactJSXExperimental: true},
    ],
  ],
  plugins: [
    'module:react-native-dotenv',
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './app/components',
          '@sagas': './app/sagas',
          '@screens': './app/screens',
          '@services': './app/services',
          '@stores': './app/stores',
          '@utils': './app/utils',
          '@hooks': './app/hooks',
          '@storage': './utils/storage',
          '@store': './app/store',
        },
      },
    ],
  ],
};
