const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'cjs' to resolver source extensions to support Firebase JS SDK v10+
config.resolver.sourceExts.push('cjs');

// Disable unstable_enablePackageExports to avoid resolution conflicts with Firebase's internal auth module loading
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
