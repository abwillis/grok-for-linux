// preload.js — Grok for Linux (app-specific wrapper)
'use strict';

const { createIPC } = require('./lib/ipc');
const { initPreload } = require('./lib/preload-core');

const IPC = createIPC('grok');

initPreload({
  appSlug:             'grok',
  hostApiName:         'grokHost',
  IPC,
  enableDirectOpen:    true,
  enableHoverTooltips: true,
});
