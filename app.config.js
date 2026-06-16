'use strict';
const defaultAppConfig = Object.freeze({
  appUrl: 'https://grok.com',
  partition: String(process.env.GROK_PARTITION ?? 'persist:grok-for-linux').trim(),
  enableLayoutCss: true,
  enableDirectOpen: true,
  enableQuickChat: true,
  defaultExportFormat: 'md',
  defaultPaneExportProfile: 'cleanMarkdown',
  defaultSelectionExportProfile: 'cleanMarkdown',
  quickPasteDelayMs: 3000,
  findContentVisibilityOverride: true,
  devToolsEnabled: true,
  enableConsoleLogging: true,
  enableFileLogging: true,
  logFileName: 'grok-for-linux.log',
});
module.exports = Object.freeze({
  appLabel: 'grok',
  appSlug: 'grok',
  appName: 'grok-for-linux',
  appUserModelId: 'your.company.grok',
  iconFileName: 'grok-for-linux.png',
  trayToolTip: 'xAI Grok',
  partitionEnvVar: 'GROK_PARTITION',
  layoutObserverGlobal: '__grok_layoutObserver',
  defaultAppConfig,
});
