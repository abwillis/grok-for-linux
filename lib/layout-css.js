// lib/layout-css.js  — Grok-specific layout CSS injection
// This module is NOT shared between apps; each app has its own layout-css.js
// that exports the same shape of API but with app-specific CSS rules.
'use strict';

const {
    CHAT_SCOPE_PSEUDO,
    CHAT_MESSAGE_LIST_PSEUDO,
    messageContentById,
} = require('./chat-dom');
const { callRendererMethod } = require('./renderer-api');

// --- Dynamic width constants -------------------------------------------------
const MAX_CHARS = 2048;
const VW_SIZE   = 100;
const MIN_VW    = 70;
const MAX_VW    = 100;

// --- Selector groups ---------------------------------------------------------
const SELECTORS = Object.freeze({
    chatScope:   CHAT_SCOPE_PSEUDO,
    messageList: CHAT_MESSAGE_LIST_PSEUDO,
});

// Conversation scope.
//
// CRITICAL: this deliberately does NOT include the bare app-shell selectors
// (main / [role="main"] / #__next main) that CHAT_SCOPE_PSEUDO carries. On the
// Grok new-chat screen that <main> also contains the left sidebar-adjacent
// content and the centered "What should we explore?" composer. Forcing
// width/min-width/overflow and a blanket descendant rule onto that shell shifted
// the centered layout off screen and left the whole center pane blank, which is
// why disabling enableLayoutCss (i.e. injecting nothing) was the only thing that
// restored it.
//
// Scoping every rule to real conversation containers makes the stylesheet inert
// on the empty new-chat page (nothing matches) while still widening an active
// conversation.
const CONVO_SCOPE_SELECTORS = [
    '[class*="conversation" i]',
    '[class*="chat-messages" i]',
    '[data-testid*="message-list" i]',
    '[data-testid*="messages" i]',
    '[role="log"]',
    '[role="feed"]'
];
const CONVO_SCOPE = CONVO_SCOPE_SELECTORS.join(',\n');

const IGNORE_SELECTORS = [
    'button',
    '[role="button"]',
    '[class*="button" i]',
    '[class*="toolbar" i]',
    '[class*="menu" i]',
    '[class*="popover" i]',
    '[class*="tooltip" i]',
    '[class*="modal" i]',
    '[class*="drawer" i]',
    '[class*="avatar" i]',
    '[class*="icon" i]',
    '[data-testid*="toolbar" i]',
    '[data-testid*="menu" i]',
    '[data-testid*="popover" i]',
    '[data-testid*="tooltip" i]'
];
const IGNORE_JOINED = IGNORE_SELECTORS.join(', ');

// --- CSS caching & injection bookkeeping -------------------------------------
const maxLayoutCssCache       = new Map();
const injectedFrameIdsByWC    = new WeakMap();
const insertedMainCssKeyByWC  = new WeakMap();
const cssApplyDebounceByWC    = new WeakMap();

// --- buildMaxLayoutCSS -------------------------------------------------------
function buildMaxLayoutCSS({ specificMessageId } = {}) {
    const CONTENT = [
        specificMessageId ? messageContentById(specificMessageId) : null,
        '[class*="conversation" i] [role="article"]',
        '[class*="conversation" i] article',
        '[class*="conversation" i] [class*="response" i]',
        '[class*="conversation" i] [class*="markdown" i]',
        '[class*="conversation" i] .prose',
        '[data-testid*="bot-message" i]',
        '[data-testid*="assistant-message" i]',
        '[data-testid*="message-content" i]',
        '[class*="message-content" i]',
    ].filter(Boolean).join(',\n');

    const TABLE_WRAPPERS = [
        '[class*="conversation" i] [role="article"]:has(table)',
        '[class*="conversation" i] article:has(table)',
        '[class*="conversation" i] div:has(> table)'
    ].join(',\n');

    return String.raw`
/* === Grok layout: max-width expansion === */
html { --grok-vw: ${VW_SIZE}vw; }

/*
 * 2026 Grok web UI no longer sizes the transcript with
 * [class*="conversation"] / [role="log"]. The live column is Tailwind:
 *
 *   .breakout { --content-max-width: <~48rem> }
 *   .max-w-breakout { max-width: var(--content-max-width) }
 *   max-w-[--content-max-width]  (arbitrary variant)
 *
 * Bubbles inside that column are often w-4/5. Override the CSS variable
 * (and the classes that read it) so the chat fills the pane next to the
 * sidebar. Use 100% — NOT 100vw — so we do not paint over the sidebar
 * and do not shove the empty new-chat composer off-screen the way a
 * blanket main { width:100%; overflow-x:hidden } rule did.
 */
:root,
html,
.breakout {
    --content-max-width: 100% !important;
}
.max-w-breakout,
[class*="max-w-breakout"],
[class*="[--content-max-width]"],
[class*="(--content-max-width)"] {
    max-width: min(var(--grok-vw, 100%), 100%) !important;
    width: 100% !important;
}
.max-w-breakout [class*="w-4/5"],
.max-w-breakout [class*="w-4\\/5"] {
    width: 100% !important;
    max-width: 100% !important;
}
.flex.flex-col.items-center > div:not([class*="absolute"]) {
    max-width: min(var(--grok-vw, 100%), 100%) !important;
    width: 100% !important;
}

/*
 * Wrapping + box-sizing ONLY inside real conversation content.
 * Never targets the app shell (main / [role="main"]), the left sidebar,
 * html/body, or the empty new-chat composer.
 */
${CONVO_SCOPE},
${CONVO_SCOPE} * {
    box-sizing: border-box !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

/* Conversation containers: full width, no side margins. */
${CONVO_SCOPE} {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    overflow-x: hidden !important;
}

/* Preserve chrome/control sizing inside expanded conversation targets. */
${CONVO_SCOPE_SELECTORS.map(s => `${s} :is(${IGNORE_JOINED})`).join(',\n')} {
    width: auto !important;
    max-width: none !important;
    min-width: initial !important;
    margin: initial !important;
    padding: initial !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
}

/* Content targets: message bubbles, response areas */
${CONTENT} {
    max-width: min(min(var(--grok-vw, ${VW_SIZE}vw), 92vw), ${MAX_CHARS}ch) !important;
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    padding-left: 20px !important;
    padding-right: 20px !important;
    text-align: left !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
}

/* User prompts: auto width, natural flow */
[class*="conversation" i] [class*="user-message" i],
[class*="conversation" i] [class*="human-message" i],
[class*="conversation" i] [class*="user-turn" i],
[data-testid*="user-message" i],
[data-testid*="human-message" i] {
    max-width: none !important;
    width: auto !important;
    margin-left: initial !important;
    margin-right: initial !important;
    display: block !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    white-space: pre-wrap !important;
}

/* Table wrappers: clamped to content max-width */
${TABLE_WRAPPERS} {
    width: 100% !important;
    max-width: min(min(var(--grok-vw, ${VW_SIZE}vw), 92vw), ${MAX_CHARS}ch) !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}

/* Tables: fixed layout, full width, collapsed borders */
[class*="conversation" i] table {
    table-layout: fixed !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: min(min(var(--grok-vw, ${VW_SIZE}vw), 92vw), ${MAX_CHARS}ch) !important;
    border-collapse: collapse !important;
    display: table !important;
}

/* Table cells: wrap text, top-align */
[class*="conversation" i] th,
[class*="conversation" i] td {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    vertical-align: top !important;
    max-width: none !important;
}

/* Code blocks: pre-wrap to prevent horizontal overflow */
[class*="conversation" i] pre,
[class*="conversation" i] code {
    white-space: pre-wrap !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    max-width: 92vw !important;
}
[class*="conversation" i] pre {
    width: 100% !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
}

/* Images, media, embeds: constrain to container width */
[class*="conversation" i] img,
[class*="conversation" i] svg,
[class*="conversation" i] canvas,
[class*="conversation" i] video,
[class*="conversation" i] iframe,
[class*="conversation" i] embed {
    max-width: 100% !important;
    height: auto !important;
}

/* Long links: wrap aggressively */
[class*="conversation" i] a {
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

/* Math blocks (KaTeX / MathJax): constrain with scroll */
[class*="conversation" i] [class*="katex" i],
[class*="conversation" i] [class*="math" i],
[class*="conversation" i] math {
    max-width: 100% !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
}
`;
}

// --- applyMaxLayoutCSS -------------------------------------------------------
function applyMaxLayoutCSS(win, { specificMessageId } = {}) {
    if (!win) return;
    const cacheKey = specificMessageId || 'default';
    let css = maxLayoutCssCache.get(cacheKey);
    if (!css) {
        css = buildMaxLayoutCSS({ specificMessageId });
        maxLayoutCssCache.set(cacheKey, css);
    }
    if (win.__appRole === 'quick' || win.__grokRole === 'quick') {
        injectCSSIntoAllFrames(win, css);
        return;
    }
    if (!win.__maxLayoutKeyHolder) {
        win.__maxLayoutKeyHolder = { key: null, css: '', __wired: false };
    }
    injectCSSOnLoad(win, css, win.__maxLayoutKeyHolder);
}

// --- injectCSSOnLoad ---------------------------------------------------------
function injectCSSOnLoad(win, css, keyHolder) {
    if (!win || !win.webContents) return;
    const wc = win.webContents;
    if (!keyHolder) return;
    keyHolder.css = String(css ?? keyHolder.css ?? '');
    const inject = () => {
        try {
            const currentCss = String(keyHolder.css ?? '');
            if (!currentCss) return;
            if (keyHolder.key) {
                try { wc.removeInsertedCSS(keyHolder.key); } catch {}
                keyHolder.key = null;
            }
            wc.insertCSS(currentCss)
                .then(k => { keyHolder.key = k; })
                .catch(() => {});
        } catch (err) {
            console.error('insertCSS failed:', err);
        }
    };
    if (!keyHolder.__wired) {
        keyHolder.__wired = true;
        wc.on('dom-ready', inject);
        wc.on('did-finish-load', inject);
        wc.on('did-navigate-in-page', inject);
        wc.on('did-start-navigation', inject);
    }
    inject();
}

// --- injectCSSIntoAllFrames --------------------------------------------------
function injectCSSIntoAllFrames(win, css) {
    if (!win || !win.webContents) return;
    const wc = win.webContents;
    const apply = () => {
        try {
            const prev = cssApplyDebounceByWC.get(wc);
            if (prev) clearTimeout(prev);
            const t = setTimeout(() => {
                try {
                    let injected = injectedFrameIdsByWC.get(wc);
                    if (!injected) {
                        injected = new Set();
                        injectedFrameIdsByWC.set(wc, injected);
                    }
                    const frames = wc.mainFrame?.framesInSubtree ?? wc.mainFrame?.frames ?? [];
                    for (const f of frames) {
                        try {
                            const rid = (typeof f?.routingId === 'number') ? f.routingId : null;
                            if (rid !== null && injected.has(rid)) continue;
                            f.insertCSS(css).then(() => { if (rid !== null) injected.add(rid); }).catch(() => {});
                        } catch {}
                    }
                    const prevKey = insertedMainCssKeyByWC.get(wc);
                    if (prevKey) { try { wc.removeInsertedCSS(prevKey); } catch {} }
                    try {
                        wc.insertCSS(css).then((k) => { insertedMainCssKeyByWC.set(wc, k); }).catch(() => {});
                    } catch {}
                } catch {}
            }, 150);
            cssApplyDebounceByWC.set(wc, t);
        } catch {}
    };
    wc.on('dom-ready', apply);
    wc.on('did-frame-finish-load', apply);
    wc.on('did-navigate-in-page', apply);
    wc.on('did-frame-navigate', apply);
    wc.on('did-start-navigation', apply);
    apply();
}

// --- renderer-agent layout bridge -----------------------------------------
// applyDynamicWidth / attachVWResize / enable+disableFindContentVisibility now
// route through the shared renderer/agent.js instead of injecting inline
// scripts. main.js builds this via createLayoutCSS({ rendererApiGlobal,
// dynamicWidth }) so the renderer calls target the app's configured global
// (window.__grokRenderer) and the app's own CSS var (--grok-vw). Keeping this
// factory shape identical to Copilot/Gemini is what lets the shared main.js
// consume it unchanged.
function createLayoutCSS({ rendererApiGlobal, dynamicWidth } = {}) {
    const rendererApiOptions = rendererApiGlobal
        ? { __rendererApiOptions: { rendererApiGlobal } }
        : null;
    function callRA(win, method, ...args) {
        if (!win?.webContents) return Promise.resolve(null);
        if (rendererApiOptions) args.push(rendererApiOptions);
        return callRendererMethod(win, method, ...args);
    }
    function applyDynamicWidth(win) {
        const vw = Number(dynamicWidth?.defaultVw ?? VW_SIZE);
        callRA(win, 'seedTargetVW', { vw }).catch(() => {});
    }
    function attachVWResize(win) {
        if (!win?.webContents) return;
        const wc = win.webContents;
        if (wc.__appVWResizeAttached) return;
        wc.__appVWResizeAttached = true;
        const screenPercent = Number(
            dynamicWidth?.screenPercent ?? dynamicWidth?.maxVw ?? MAX_VW
        );
        callRA(win, 'startVWResize', { screenPercent }).catch(() => {});
    }
    function enableFindContentVisibility(win) {
        return callRA(win, 'enableFindContentVisibility');
    }
    function disableFindContentVisibility(win) {
        return callRA(win, 'disableFindContentVisibility');
    }
    return {
        applyDynamicWidth,
        attachVWResize,
        enableFindContentVisibility,
        disableFindContentVisibility,
    };
}

// --- requestExpandedLayout ---------------------------------------------------
function requestExpandedLayout(win) {
    if (!win || !win.webContents) return;
    const script = `
(function() {
    try {
        window.postMessage({
            type: 'host:setLayoutMode',
            payload: { mode: 'expanded' }
        }, '*');
        window.dispatchEvent(new Event('resize'));
    } catch (e) {
        console.error('PostMessage layout request failed:', e);
    }
})();
`;
    const run = () => {
        try { win.webContents.executeJavaScript(script).catch(() => {}); }
        catch (err) { console.error('requestExpandedLayout failed:', err); }
    };
    win.webContents.on('did-finish-load', run);
    win.webContents.on('did-navigate-in-page', run);
    run();
}

// --- Content-visibility for find-in-page (stub for API compat) -------------
// The Find visibility override now lives in renderer/agent.js
// (enable/disableFindContentVisibility above, via createLayoutCSS). This stub
// remains only so any caller importing buildFindContentVisibilityCSS keeps a
// valid function; it intentionally returns no CSS.
function buildFindContentVisibilityCSS() { return ''; }

// ============================================================================
module.exports = {
    SELECTORS, IGNORE_SELECTORS, IGNORE_JOINED,
    messageContentById,
    MAX_CHARS, VW_SIZE, MIN_VW, MAX_VW,
    buildMaxLayoutCSS,
    maxLayoutCssCache, injectedFrameIdsByWC, insertedMainCssKeyByWC, cssApplyDebounceByWC,
    injectCSSOnLoad, injectCSSIntoAllFrames, applyMaxLayoutCSS, requestExpandedLayout,
    buildFindContentVisibilityCSS,
    createLayoutCSS,
};
