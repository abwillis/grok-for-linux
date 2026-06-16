// lib/layout-css.js  — Grok-specific layout CSS injection
// This module is NOT shared between apps; each app has its own layout-css.js
// that exports the same shape of API but with app-specific CSS rules.
'use strict';

const {
    CHAT_SCOPE_PSEUDO,
    CHAT_MESSAGE_LIST_PSEUDO,
    messageContentById,
} = require('./chat-dom');

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
        '[class*="conversation" i] div:has(> table)',
        `${CHAT_SCOPE_PSEUDO} [role="article"]:has(table)`,
        `${CHAT_SCOPE_PSEUDO} article:has(table)`,
        `${CHAT_SCOPE_PSEUDO} div:has(> table)`
    ].join(',\n');

    const CONTAINERS = [
        CHAT_SCOPE_PSEUDO,
        CHAT_MESSAGE_LIST_PSEUDO,
        '[class*="conversation" i]',
        '[class*="chat-messages" i]',
        '[class*="messages" i]'
    ].join(',\n');

    return String.raw`
/* === Grok layout: max-width expansion === */
html { --grok-vw: ${VW_SIZE}vw; }

html, body {
    height: 100vh !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    word-break: break-word !important;
}

@supports (overflow: clip) {
    html, body { overflow-x: clip !important; }
}

/* All descendants of the chat scope: constrain & wrap */
${CHAT_SCOPE_PSEUDO},
${CHAT_SCOPE_PSEUDO} * {
    box-sizing: border-box !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

/* Chat scope root: full width, vertical scroll only */
${CHAT_SCOPE_PSEUDO} {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    scrollbar-gutter: stable both-edges !important;
}

/* Message list / conversation containers: full width, no side margins */
${CHAT_MESSAGE_LIST_PSEUDO},
[class*="conversation" i],
[class*="chat-messages" i],
[class*="messages" i] {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    overflow-x: hidden !important;
    overflow-y: visible !important;
}

/* Preserve chrome/control sizing inside expanded layout targets. */
${CONTAINERS} :is(${IGNORE_JOINED}) {
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

/* Input area: keep full width and visible */
[class*="input-area" i],
[class*="composer" i],
[class*="prompt-box" i],
[class*="text-input" i],
form[class*="chat" i],
${CHAT_SCOPE_PSEUDO} textarea,
${CHAT_SCOPE_PSEUDO} [contenteditable="true"],
${CHAT_SCOPE_PSEUDO} div[role="textbox"] {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    overflow: visible !important;
    visibility: visible !important;
    opacity: 1 !important;
    flex: 1 1 auto !important;
}

/* User prompts: auto width, natural flow */
[class*="user-message" i],
[class*="human-message" i],
[class*="user-turn" i],
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
[class*="conversation" i] table,
${CHAT_SCOPE_PSEUDO} table {
    table-layout: fixed !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: min(min(var(--grok-vw, ${VW_SIZE}vw), 92vw), ${MAX_CHARS}ch) !important;
    border-collapse: collapse !important;
    display: table !important;
}

/* Table cells: wrap text, top-align */
[class*="conversation" i] th,
[class*="conversation" i] td,
${CHAT_SCOPE_PSEUDO} th,
${CHAT_SCOPE_PSEUDO} td {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    vertical-align: top !important;
    max-width: none !important;
}

/* Code blocks: pre-wrap to prevent horizontal overflow */
[class*="conversation" i] pre,
[class*="conversation" i] code,
${CHAT_SCOPE_PSEUDO} pre,
${CHAT_SCOPE_PSEUDO} code {
    white-space: pre-wrap !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    max-width: 92vw !important;
}

[class*="conversation" i] pre,
${CHAT_SCOPE_PSEUDO} pre {
    width: 100% !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
}

/* Images, media, embeds: constrain to container width */
${CHAT_SCOPE_PSEUDO} img,
${CHAT_SCOPE_PSEUDO} svg,
${CHAT_SCOPE_PSEUDO} canvas,
${CHAT_SCOPE_PSEUDO} video,
${CHAT_SCOPE_PSEUDO} iframe,
${CHAT_SCOPE_PSEUDO} embed {
    max-width: 100% !important;
    height: auto !important;
}

/* Long links: wrap aggressively */
${CHAT_SCOPE_PSEUDO} a {
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

/* Math blocks (KaTeX / MathJax): constrain with scroll */
${CHAT_SCOPE_PSEUDO} [class*="katex" i],
${CHAT_SCOPE_PSEUDO} [class*="math" i],
${CHAT_SCOPE_PSEUDO} math {
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

// --- applyDynamicWidth -------------------------------------------------------
function applyDynamicWidth(win) {
    if (!win) return;
    const script = String.raw`(function(){try{
        const root = document.documentElement;
        if (!getComputedStyle(root).getPropertyValue('--grok-vw')) {
            root.style.setProperty('--grok-vw', '${VW_SIZE}vw');
        }
        window.__grok_getTargetVW = function(){
            try { const v = getComputedStyle(root).getPropertyValue('--grok-vw').trim();
            const m = /^(\d+)vw$/.exec(v); return m ? parseInt(m[1],10) : ${VW_SIZE}; } catch { return ${VW_SIZE}; }
        };
        window.__grok_setTargetVW = function(v){
            try { const c = Math.max(${MIN_VW}, Math.min(${MAX_VW}, Math.round(v))); root.style.setProperty('--grok-vw', c+'vw'); } catch {}
        };
    }catch(e){} })();`;
    try { win.webContents.executeJavaScript(script).catch(()=>{}); } catch {}
}

// --- attachVWResize ----------------------------------------------------------
// Responsive VW: keep --grok-vw tied to window size (95 → 70vw range)
function attachVWResize(win) {
    if (!win || !win.webContents) return;
    const wc = win.webContents;
    if (wc.__grokVWResizeAttached) return;
    wc.__grokVWResizeAttached = true;

    const script = `
(function () {
    try {
        const MAX = 95; const MIN = 70;
        const root = document.documentElement;
        function computeVW() {
            try {
                const screenW = (window.screen && window.screen.width) ? window.screen.width : window.innerWidth;
                const winW = window.innerWidth;
                let vw = Math.round((winW / screenW) * MAX);
                vw = Math.max(MIN, Math.min(MAX, vw));
                root.style.setProperty('--grok-vw', vw + 'vw');
                if (window.__grok_setTargetVW) window.__grok_setTargetVW(vw);
            } catch {}
        }
        computeVW();
        window.addEventListener('resize', computeVW, { passive: true });
        window.addEventListener('orientationchange', computeVW, { passive: true });
    } catch {}
})();
`;
    const run = () => { try { wc.executeJavaScript(script).catch(() => {}); } catch {} };
    wc.once('dom-ready', run);
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

// --- Content-visibility for find-in-page -------------------------------------
function buildFindContentVisibilityCSS() {
    return String.raw`
${CHAT_SCOPE_PSEUDO},
${CHAT_SCOPE_PSEUDO} * {
    content-visibility: visible !important;
    contain-intrinsic-size: auto !important;
}
`;
}

function enableFindContentVisibility(win) {
    if (!win || !win.webContents) return;
    if (!win.__findContentVisibilityKeyHolder) {
        win.__findContentVisibilityKeyHolder = { key: null, css: '', __wired: false };
    }
    injectCSSOnLoad(win, buildFindContentVisibilityCSS(), win.__findContentVisibilityKeyHolder);
}

function disableFindContentVisibility(win) {
    if (!win || !win.webContents || !win.__findContentVisibilityKeyHolder) return;
    const holder = win.__findContentVisibilityKeyHolder;
    if (holder.key) {
        try { win.webContents.removeInsertedCSS(holder.key); } catch {}
        holder.key = null;
    }
    holder.css = '';
}

// ============================================================================
module.exports = {
    SELECTORS, IGNORE_SELECTORS, IGNORE_JOINED,
    messageContentById,
    MAX_CHARS, VW_SIZE, MIN_VW, MAX_VW,
    applyDynamicWidth, attachVWResize, buildMaxLayoutCSS,
    maxLayoutCssCache, injectedFrameIdsByWC, insertedMainCssKeyByWC, cssApplyDebounceByWC,
    injectCSSOnLoad, injectCSSIntoAllFrames, applyMaxLayoutCSS, requestExpandedLayout,
    buildFindContentVisibilityCSS, enableFindContentVisibility, disableFindContentVisibility,
};
