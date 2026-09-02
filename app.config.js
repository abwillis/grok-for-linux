'use strict';

const defaultAppConfig = Object.freeze({
  appUrl: 'https://grok.com',
  partition: String(process.env.GROK_PARTITION ?? 'persist:grok-for-linux').trim(),
  enableLayoutCss: true,
  enableDirectOpen: true,
  enableQuickChat: true,

  // --- Export: decorative-icon stripping (new, shared default) ---
  // Drop decorative UI icons (file-type glyphs on attachment/reference chips,
  // favicons) from exports instead of inlining them as base64. Real content
  // images are unaffected. Set false to embed every image.
  stripDecorativeIcons: true,
  // cleanMarkdown export strips UI chrome via DOM_CLEANUP_SELECTORS: buttons,
  // copy/feedback widgets, toolbars, and code-gutter line numbers / "Show more
  // lines" expanders. Content selectors (pre, code, table, lists, images) are
  // preserved. Set false to make cleanMarkdown behave like rawMarkdown.
  cleanMarkdownStripsJunk: true,

  // --- Export: flatten-retry + scroller-stability (new, shared default) ---
  // Retry the flatten/capture until captured content stops growing; both paths
  // first wait for the live scroller range to hold steady so nothing is
  // captured mid-layout. All bounded so they can never hang.
  flattenRetryMaxPasses: 4,
  flattenRetryBudgetMs: 60000,
  scrollerStableSamples: 2,
  scrollerStablePollMs: 400,
  scrollerStableBudgetMs: 8000,
  scrollerStableBeforePdf: true,

  // Grok keeps markdown as its default export profile.
  defaultExportFormat: 'md',
  defaultPaneExportProfile: 'cleanMarkdown',
  defaultSelectionExportProfile: 'cleanMarkdown',
  quickPasteDelayMs: 3000,
  findContentVisibilityOverride: true,
  devToolsEnabled: true,

  // --- Export diagnostics (new, shared default) ---
  enableExportDiagnostics: false,
  // Conversation export diagnostic: logs per-row user/assistant classification,
  // geometry, connectivity and reasoning-control attributes at each export
  // stage. Independent of enableExportDiagnostics. Set false to silence.
  enableConversationExportDiagnostic: true,

  // --- Reasoning expansion (new, shared default) ---
  // Expand chain-of-thought reasoning before taking the markdown/HTML/text
  // snapshot so those exports contain the same reasoning the PDF does. Adds
  // roughly a second per reasoning panel; set false for headlines only.
  expandReasoningForSnapshot: true,
  // PDF export's own post-flatten reasoning attempt. Off by default: it cannot
  // work reliably from inside the export pipeline. Use View > Expand first.
  enableReasoningExpansion: false,
  // Wall-clock ceiling for the whole reasoning-expansion pass, in ms.
  reasoningExpandBudgetMs: 60000,

  // --- Large-pane PDF chunking (new, shared default) ---
  // Render large PDFs as stitched page-range slices so a single giant
  // printToPDF() pass cannot exhaust the renderer. Engages once the estimated
  // page count exceeds pdfChunkPageThreshold.
  enablePdfChunking: true,
  pdfChunkPageThreshold: 50,
  pdfChunkSize: 50,
  pdfChunkPageHeightPx: 1056,

  enableConsoleLogging: true,
  enableFileLogging: true,
  logFileName: 'grok-for-linux.log',

  // --- Renderer console capture (new, shared default) ---
  // Capture renderer-side console output (renderer/agent.js, preload, and the
  // hosted web app) via Electron's webContents 'console-message' event.
  // Written to rendererLogFileName so the noisy hosted web app cannot drown
  // out the app's own main-process log.
  enableRendererConsoleCapture: true,
  rendererLogFileName: 'grok-for-linux-renderer.log',
  // Verbose diagnostic dumps are written to the log FILE but kept off the
  // console by default. Set true to also print them to the terminal.
  verboseDiagnosticsToConsole: false,
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
  // Added to match Copilot/Gemini: the shared renderer-api / agent wiring
  // requires these. Grok was previously missing both.
  rendererApiGlobal: '__grokRenderer',
  rendererAgentVersion: 1,

  dynamicWidth: Object.freeze({
    cssVar: '--grok-vw',
    minVw: 70,
    maxVw: 100,
    defaultVw: 100,
    screenPercent: 95,
  }),

  defaultAppConfig,
});
