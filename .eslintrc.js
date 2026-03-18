module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Warn on `any` type usage — helps enforce TypeScript type safety.
    // Upgrade to "error" once existing violations are resolved.
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
