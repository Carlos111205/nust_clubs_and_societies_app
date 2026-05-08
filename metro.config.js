const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize Metro for faster loading
config.maxWorkers = 2; // Reduce workers on Windows to prevent context switching overhead
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
