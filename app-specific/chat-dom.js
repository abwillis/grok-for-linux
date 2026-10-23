// lib/chat-dom.js  — Grok-specific DOM selector constants
// This module is NOT shared between apps; each app has its own chat-dom.js
// that exports the same shape of API but with app-specific selectors.
'use strict';

// === Selector constants (Grok web UI 2025) ===================================

const CHAT_ROOT_SELECTORS = [
    '#__next main',
    'main[class*="chat" i]',
    'main[class*="conversation" i]',
    '[data-testid="chat-container"]',
    '[data-testid="conversation-container"]',
    '[role="main"]',
    'main'
];

const CHAT_MESSAGE_LIST_SELECTORS = [
    '[role="log"]',
    '[role="feed"]',
    '[data-testid*="message-list" i]',
    '[data-testid*="messages" i]',
    '[class*="messages" i]',
    '[class*="conversation-turns" i]',
    '[class*="chat-messages" i]'
];

const CHAT_SCOPE_SELECTOR   = CHAT_ROOT_SELECTORS.join(', ');
const CHAT_SCOPE_PSEUDO     = `:is(${CHAT_SCOPE_SELECTOR})`;
const CHAT_MESSAGE_LIST_SELECTOR = CHAT_MESSAGE_LIST_SELECTORS.join(', ');
const CHAT_MESSAGE_LIST_PSEUDO   = `:is(${CHAT_MESSAGE_LIST_SELECTOR})`;

const EXPORT_ROOT_CLASS    = 'grok-export-root';
const EXPORT_ROOT_SELECTOR = `.${EXPORT_ROOT_CLASS}`;

// CSS identifier escape for safe use in selectors
function cssIdentEscape(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/#/g, '\\#')
        .replace(/\./g, '\\.')
        .replace(/:/g, '\\:')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\s/g, '\\ ');
}

// Parameterized single-message selector (uses cssIdentEscape for safety)
function messageContentById(id) {
    const escaped = cssIdentEscape(id);
    return `${CHAT_SCOPE_PSEUDO} #${escaped}, ${CHAT_MESSAGE_LIST_PSEUDO} #${escaped}, [id="${String(id ?? '').replace(/"/g, '\\"')}"]`;
}

// Code-preview iframe selector (Grok may use sandboxed iframes for rendered code)
const CODE_PREVIEW_IFRAME_SELECTOR =
    'iframe[src*="sandbox"], iframe[class*="preview" i], iframe[data-testid*="code" i]';

// === DOM cleanup ("junk") selectors ==========================================
const DOM_CLEANUP_SELECTORS = [
    'button',
    '[role="button"]',
    '[class*="button" i]',
    '[class*="logo" i]',
    '[class*="avatar" i]',
    '[class*="icon" i]:not(pre [class*="icon" i])',
    '[class*="action" i]',
    '[class*="toolbar" i]',
    '[class*="copy" i]',
    '[class*="feedback" i]',
    '[class*="thumb" i]',
    '[class*="reaction" i]',
    '[class*="share" i]',
    'label',
    'input',
    'textarea',
    '[role="textbox"]',
    '[contenteditable="true"]',
    'nav',
    'aside',
    'header',
    'footer'
];

// === Preserve selectors (used during cleanup) ================================
const PRESERVE_SELECTORS = [
    'pre', 'code', 'table',
    '[role="table"]', '[role="grid"]',
    'ul', 'ol', 'li',
    'article', '[role="article"]',
    'img', 'picture', 'svg', 'canvas', 'video',
    'iframe',
    '[class*="table-wrapper" i]',
    '[class*="table-container" i]',
    '[class*="horizontal-scroll" i]',
    'blockquote',
    'math', '[class*="math" i]', '[class*="katex" i]'
];

// Alias for compat with shared code that may reference the Copilot-style name
const DOM_PRESERVE_CONTENT_SELECTORS = PRESERVE_SELECTORS;

// === Reasoning / chain-of-thought expand controls ============================
// Intentionally EMPTY (explicit no-op). The shared main.js imports this and
// passes it to renderer/agent.js as reasoningExpandSelectors; agent.js only
// acts when the array is non-empty, so an empty list disables reasoning-panel
// expansion for Grok rather than leaving the value accidentally undefined.
// Grok's reasoning DOM ("Thinking" trace) has not been mapped yet -- populate
// with app-correct [aria-expanded="false"] selectors to enable the feature.
const REASONING_EXPAND_SELECTORS = [];

// === Renderer-agent scoring / collection config ==============================
// These are consumed by the shared renderer/agent.js (via main.js init()) and
// by the shared exporters. They are intentionally app-specific: the generic
// agent must not embed Grok DOM fingerprints, so each app supplies its own.
// Grok's web UI (Next.js shell, data-testid + class-based message nodes) is
// the basis for the selectors below.

// Virtualized scroller candidates. The agent tries these in order and picks
// the first that also scrolls. Grok renders the conversation inside the
// Next.js main/log containers.
const VIRTUALIZER_SELECTORS = [
    '[role="log"]',
    '[data-testid*="conversation" i]',
    '[class*="conversation" i]',
    '[class*="chat-messages" i]',
    '#__next main'
];

// scoreElement() weights: each selector contributes match-count * weight when
// the agent picks the best chat root.
const DOM_SCORE_RULES = [
    { selector: '[data-testid*="bot-message" i]', weight: 25 },
    { selector: '[data-testid*="assistant-message" i]', weight: 25 },
    { selector: '[data-testid*="message-content" i]', weight: 20 },
    { selector: '[class*="markdown" i]', weight: 15 },
    { selector: '.prose', weight: 15 },
    { selector: '[role="article"]', weight: 10 }
];

// Message-like nodes collected from a mounted/virtualized pane.
const DOM_COLLECTION_SELECTORS = [
    '[data-testid*="bot-message" i]',
    '[data-testid*="assistant-message" i]',
    '[data-testid*="user-message" i]',
    '[data-testid*="human-message" i]',
    '[data-testid*="message-content" i]',
    '[class*="message-content" i]',
    '[class*="markdown" i]',
    '.prose',
    '[role="article"]'
];

// Which collection selectors identify a user turn and which an assistant turn.
// The shared renderer agent classifies rows with these lists instead of
// guessing from keywords in the selector text.
const DOM_ROLE_SELECTORS = Object.freeze({
    user: Object.freeze([
        '[data-testid*="user-message" i]',
        '[data-testid*="human-message" i]'
    ]),
    assistant: Object.freeze([
        '[data-testid*="bot-message" i]',
        '[data-testid*="assistant-message" i]'
    ])
});

// Grok has no verified answer label in its DOM text, so none is searched
// for. Set these (see Copilot's chat-dom.js) only after confirming the label.
const ANSWER_MARKER = '';
const ANSWER_LEADING_LABELS = Object.freeze([]);

// Row wrappers that hold one conversation turn.
const DOM_COLLECTION_ROW_SELECTORS = [
    '[data-testid*="conversation-turn" i]',
    '[class*="conversation-turn" i]',
    '[class*="message-row" i]',
    '[role="article"]'
];

// Chrome that must never be collected as message content.
const DOM_COLLECTION_EXCLUDE_SELECTORS = [
    'nav',
    'aside',
    'header',
    'footer',
    '[class*="sidebar" i]',
    '[class*="composer" i]',
    '[class*="input-area" i]',
    '[class*="action-bar" i]',
    '[class*="toolbar" i]'
];

// Stable-ish attributes used to dedupe collected nodes.
const DOM_COLLECTION_KEY_ATTRIBUTES = [
    'data-message-id',
    'data-testid',
    'id',
    'aria-label'
];

// Selectors that indicate Grok's chat input editor has mounted. Used by the
// shared renderer/agent.js waitForChatInputReady().
const CHAT_INPUT_SELECTORS = [
    'textarea',
    '[contenteditable="true"]',
    'div[role="textbox"]'
];

// ============================================================================
// Formal capability contract consumed by renderer/agent.js. Selectors remain
// provider-specific evidence sources; no selector is treated as authoritative
// without structural and behavioral validation in the shared agent.
const DOM_ADAPTER_CONTRACT = Object.freeze({
    version: 1,
    thresholds: Object.freeze({ read: 55, interact: 70, destructive: 85 }),
    negativeRegionSelectors: Object.freeze([
        'nav', 'header', 'aside', '[role="navigation"]', '[role="toolbar"]',
        '[role="dialog"]', '[role="search"]', '[role="menu"]'
    ]),
    capabilities: Object.freeze({
        chatRoot: Object.freeze({
            selectors: CHAT_ROOT_SELECTORS,
            semanticSelectors: Object.freeze(['[role="feed"]', '[role="log"]', 'main', '[role="main"]']),
            repeatedDescendants: DOM_COLLECTION_SELECTORS,
            stableAttributeHints: Object.freeze(['chat', 'message', 'feed', 'conversation'])
        }),
        messageRow: Object.freeze({
            selectors: DOM_COLLECTION_ROW_SELECTORS,
            semanticSelectors: Object.freeze(['article', '[role="article"]', '[aria-posinset]']),
            stableAttributeHints: Object.freeze(['message', 'turn', 'response', 'request'])
        }),
        composer: Object.freeze({
            selectors: CHAT_INPUT_SELECTORS,
            semanticSelectors: Object.freeze(['textarea', '[contenteditable="true"]', '[role="textbox"]']),
            stableAttributeHints: Object.freeze(['composer', 'prompt', 'chat-input', 'message-input'])
        }),
        disclosureControl: Object.freeze({
            selectors: REASONING_EXPAND_SELECTORS.concat([
                'button[aria-expanded]', '[role="button"][aria-expanded]', 'summary'
            ]),
            semanticSelectors: Object.freeze([
                'button[aria-expanded]', '[role="button"][aria-expanded]', 'summary'
            ]),
            stableAttributeHints: Object.freeze(['expand', 'collapse', 'disclosure', 'reasoning', 'show-more'])
        }),
        virtualizer: Object.freeze({
            selectors: VIRTUALIZER_SELECTORS,
            stableAttributeHints: Object.freeze(['virtual', 'scroll', 'message-list'])
        })
    })
});

const DOM_CLEANUP_POLICY = Object.freeze({
    // Broad selectors nominate candidates only. The shared agent removes or
    // unwraps a candidate only after interactive and content-preservation checks.
    candidateSelectors: Object.freeze(DOM_CLEANUP_SELECTORS.concat([
        'button', '[role="button"]', '[role="toolbar"]', '[role="menu"]',
        '[role="menuitem"]', '[aria-haspopup]'
    ])),
    interactiveSelectors: Object.freeze([
        'button', '[role="button"]', '[role="toolbar"]', '[role="menu"]',
        '[role="menuitem"]', '[aria-haspopup]'
    ]),
    preserveSelectors: Object.freeze(Array.from(new Set(
        DOM_PRESERVE_CONTENT_SELECTORS.concat([
            'a[href]', '[data-preserve]', '[data-testid*="citation" i]',
            '[data-testid*="reference" i]', '[data-file-name]',
            '[data-attachment]', '[class*="attachment" i]'
        ])
    )))
});

module.exports = {
    CHAT_ROOT_SELECTORS,
    CHAT_MESSAGE_LIST_SELECTORS,
    CHAT_SCOPE_SELECTOR,
    CHAT_SCOPE_PSEUDO,
    CHAT_MESSAGE_LIST_SELECTOR,
    CHAT_MESSAGE_LIST_PSEUDO,
    EXPORT_ROOT_CLASS,
    EXPORT_ROOT_SELECTOR,
    CODE_PREVIEW_IFRAME_SELECTOR,
    DOM_CLEANUP_SELECTORS,
    DOM_CLEANUP_POLICY,
    DOM_ADAPTER_CONTRACT,
    DOM_PRESERVE_CONTENT_SELECTORS,
    REASONING_EXPAND_SELECTORS,
    VIRTUALIZER_SELECTORS,
    DOM_SCORE_RULES,
    DOM_COLLECTION_SELECTORS,
    DOM_ROLE_SELECTORS,
    ANSWER_MARKER,
    ANSWER_LEADING_LABELS,
    DOM_COLLECTION_ROW_SELECTORS,
    DOM_COLLECTION_EXCLUDE_SELECTORS,
    DOM_COLLECTION_KEY_ATTRIBUTES,
    CHAT_INPUT_SELECTORS,
    messageContentById,
};
