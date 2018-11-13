module.exports = {
  plugins: [
    require('postcss-normalize'),
    require('postcss-preset-env')({
      stage: 2,
      features: {
        'nesting-rules': true,
        'custom-selectors': true,
        'custom-media-queries': true,
        'color-mod-function': true,
        'overflow-property': true
      }
    }),
    require('css-mqpacker'),
  ]
};
