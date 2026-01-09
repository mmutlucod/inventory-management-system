module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@database': './src/database',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@utils': './src/utils',
            '@types': './src/types',
            '@theme': './src/theme',
            '@localization': './src/localization',
            '@providers': './src/providers',
          },
        },
      ],
      // 'react-native-reanimated/plugin',
    ],
  };
};