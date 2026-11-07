const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const web = path.resolve(__dirname, 'web').replace(/[/\\]/g, '[/\\\\]');

config.resolver.blockList = [new RegExp(`^${web}[/\\\\].*`)];

module.exports = config;
