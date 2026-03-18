module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['@babel/plugin-transform-export-namespace-from'],
  env: {
    production: {
      // Automatically removes ALL console.log / console.warn / console.error
      // calls from production builds. Zero manual work required.
      plugins: ['transform-remove-console'],
    },
  },
};
