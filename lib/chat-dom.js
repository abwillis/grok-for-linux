// lib/chat-dom.js  — Grok-specific DOM selector constants & detection scripts
// This module is NOT shared between apps; each app has its own chat-dom.js
// that exports the same shape of API but with app-specific selectors.
'use strict';

// === Selector constants (Grok web UI 2025) ===================================

const CHAT_SELECTOR = '#__next main';  // Legacy/fallback root selector

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
    '[class*="chat-messages" i]',
    '[role="main"]'
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

// === Transcript child selectors (Grok-specific) ==============================
const TRANSCRIPT_SELECTORS = [
    '[data-testid*="bot-message" i]',
    '[data-testid*="assistant-message" i]',
    '[data-testid*="message-content" i]',
    '[class*="response" i]:not([class*="footer" i]):not([class*="action" i])',
    '[class*="message-content" i]',
    '[class*="markdown" i]',
    '.prose',
    '[role="article"]',
    'article',
    'section',
    'main'
];

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

// === Chrome/UI penalty selectors =============================================
const CHROME_PENALTY_SELECTOR =
    'nav,' +
    'aside,' +
    '[role="navigation"],' +
    '[class*="sidebar" i],' +
    '[class*="sidenav" i],' +
    '[class*="side-panel" i],' +
    '[class*="drawer" i],' +
    '[class*="header" i]:not([class*="message" i]),' +
    '[class*="footer" i],' +
    '[class*="input-area" i],' +
    '[class*="composer" i],' +
    '[class*="prompt-box" i],' +
    '[class*="action-bar" i]';

const CHROME_PENALTY_REGEX =
    /(sidebar|sidenav|side-panel|drawer|navigation|nav-|prompt|action-bar|toolbar|footer|header|composer|input-area)/i;

// === User-prompt detection selectors =========================================
const USER_PROMPT_SELECTOR =
    '[data-testid*="user-message" i],' +
    '[data-testid*="human-message" i],' +
    '[class*="user-message" i],' +
    '[class*="human-message" i],' +
    '[class*="user-turn" i]';

const USER_PROMPT_REGEX = /(user-message|human-message|user-turn|query)/i;

// === Semantic table selectors ================================================
const TABLE_SIGNAL_SELECTORS = [
    'table',
    '[role="table"]',
    '[role="grid"]',
    '[class*="table-wrapper" i]',
    '[class*="table-container" i]',
    '[class*="horizontal-scroll" i]'
];
const TABLE_SIGNAL_SELECTOR_JOINED = TABLE_SIGNAL_SELECTORS.join(', ');
const TABLE_SIGNAL_HTML_REGEX =
    /<table\b|role="table"|role="grid"|class="[^"]*(?:table-wrapper|table-container|horizontal-scroll)[^"]*"/gi;

// === Promotion-candidate selectors ===========================================
const PROMOTION_STOP_SELECTOR = '#__next, main, [role="main"], body, html';

const PROMOTION_CANDIDATE_SELECTOR =
    '[data-testid*="message-content" i],' +
    '[data-testid*="bot-message" i],' +
    '[class*="response" i],' +
    '[class*="message-content" i],' +
    '[class*="markdown" i],' +
    '.prose,' +
    '[class*="conversation" i],' +
    '[class*="table-wrapper" i],' +
    '[class*="horizontal-scroll" i]';

const PROMOTION_CANDIDATE_REGEX =
    /(response|message-content|conversation|markdown|prose|table-wrapper|horizontal-scroll)/i;

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
const PRESERVE_SELECTOR_JOINED = PRESERVE_SELECTORS.join(', ');

// Alias for compat with shared code that may reference the Copilot-style name
const DOM_PRESERVE_CONTENT_SELECTORS = PRESERVE_SELECTORS;

// === buildLocateChatRootScript ===============================================
// Returns a JS string that, when executed in the renderer, locates the
// best chat root element and optionally returns its outerHTML.
//
// Contract note:
// This function intentionally supports the same higher-level options used by
// the shared exporters module:
//
// - includeHtml:    Return the selected node's HTML.
// - cleanupJunk:    Remove obvious Grok chrome/input/action UI from the returned HTML.
// - selectContent:  Select the scored best element in the live renderer document.
// - scrollIntoView: Bring the scored best element into view before returning/selecting.
//
// Keeping this contract aligned with Copilot/Gemini lets shared exporter logic
// use the direct-select path instead of relying on selector fallback behavior.
function buildLocateChatRootScript({
    includeHtml = true,
    cleanupJunk = false,
    selectContent = false,
    scrollIntoView = false,
    markForExport = false
} = {}) {
    const selectorsJson = JSON.stringify(CHAT_ROOT_SELECTORS);
    const transcriptJson = JSON.stringify(TRANSCRIPT_SELECTORS);
    const junkJson = JSON.stringify(DOM_CLEANUP_SELECTORS);
    const preserveJson = JSON.stringify(PRESERVE_SELECTORS);
    const includeHtmlLiteral     = includeHtml     ? 'true' : 'false';
    const cleanupJunkLiteral     = cleanupJunk     ? 'true' : 'false';
    const selectContentLiteral   = selectContent   ? 'true' : 'false';
    const scrollIntoViewLiteral  = scrollIntoView  ? 'true' : 'false';
    const markForExportLiteral   = markForExport   ? 'true' : 'false';

    return `
(function () {
    const candidates = ${selectorsJson};
    const transcriptSelectors = ${transcriptJson};
    const junkSelectors = ${junkJson};
    const preserveSelectors = ${preserveJson};

    function visible(el) {
        if (!el) return false;
        const r = el.getBoundingClientRect?.();
        return !!r && r.width > 0 && r.height > 0;
    }
    function textOf(el) {
        try { return String(el?.innerText || el?.textContent || ''); } catch { return ''; }
    }
    function count(el, sel) {
        try { return el?.querySelectorAll?.(sel)?.length || 0; } catch { return 0; }
    }
    function semanticBonus(el) {
        try {
            let bonus = 0;
            if (el.matches?.('[data-testid*="bot-message" i], [data-testid*="assistant-message" i], [data-testid*="message-content" i]')) bonus += 1400;
            if (el.matches?.('[class*="markdown" i], .prose, [class*="message-content" i]')) bonus += 1000;
            if (el.matches?.('[class*="response" i]:not([class*="footer" i]):not([class*="action" i])')) bonus += 700;
            if (count(el, 'table, [class*="table-wrapper" i], [class*="horizontal-scroll" i]') > 0) bonus += 180;
            return bonus;
        } catch { return 0; }
    }
    function chromePenalty(el) {
        try {
            let penalty = 0;
            if (el.matches?.('${CHROME_PENALTY_SELECTOR}')) penalty += 2200;
            const cls = String(el.className || '');
            if (${CHROME_PENALTY_REGEX}.test(cls)) penalty += 1200;
            return penalty;
        } catch { return 0; }
    }
    function editablePenalty(el) {
        const selfEditable = !!el?.matches?.('textarea, input, [contenteditable="true"], div[role="textbox"]');
        if (selfEditable) return 2000;
        return (count(el, 'textarea, input, [contenteditable="true"], div[role="textbox"]') * 900)
            + (count(el, 'form') * 300)
            + (count(el, '[role="button"], button') * 8);
    }
    function score(el) {
        if (!el || !visible(el)) return -1;
        const text = textOf(el).trim();
        const len = Math.min(text.length, 5000);
        const articleCount = count(el, '[role="article"], article');
        const responseCount = count(el,
            '[data-testid*="bot-message" i],' +
            '[data-testid*="assistant-message" i],' +
            '[data-testid*="message-content" i],' +
            '[class*="markdown" i],' +
            '.prose,' +
            '[class*="response" i],' +
            '[class*="message-content" i]'
        );
        const richCount = count(el, 'table, pre, code, ul, ol, blockquote');
        const scrollable = (() => {
            try {
                const cs = getComputedStyle(el);
                return (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight) ? 1 : 0;
            } catch { return 0; }
        })();
        return 1000
            + Math.min(len, 1600)
            + (articleCount * 90)
            + (responseCount * 60)
            + (richCount * 25)
            + (scrollable * 50)
            + semanticBonus(el)
            - chromePenalty(el)
            - editablePenalty(el);
    }

    const found = [];
    for (const sel of candidates) {
        try {
            document.querySelectorAll(sel).forEach((root) => {
                found.push({ sel, el: root });
                transcriptSelectors.forEach((childSel) => {
                    try { root.querySelectorAll(childSel).forEach((el) => found.push({ sel: childSel, el })); } catch {}
                });
            });
        } catch {}
    }
    if (!found.length) return null;

    const scored = found
        .map(({ sel, el }) => ({ sel, el, score: score(el), textLength: textOf(el).trim().length }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.textLength - a.textLength;
        });
    const best = scored[0];
    if (!best || !best.el) return null;

    /*
     * Derive the pane root independently from the scored content node.
     *
     * Important:
     * Do NOT pool narrow chat containers and broad app shells together and
     * then sort by innerText length.  Broad shells often include Grok's left
     * sidebar (conversation history) plus the right chat pane, so they
     * naturally have more text and incorrectly win.
     *
     * Instead:
     * 1. Try narrow message-list / feed containers first.
     * 2. Then try conversation / chat-messages containers.
     * 3. Then try Next.js main or data-testid chat containers.
     * 4. Use broad [role="main"] / main only as a last resort.
     */
    function findPaneRoot(el) {
        function areaOf(node) {
            try {
                const r = node.getBoundingClientRect?.();
                if (!r) return Number.POSITIVE_INFINITY;
                return Math.max(1, Number(r.width || 0) * Number(r.height || 0));
            } catch {
                return Number.POSITIVE_INFINITY;
            }
        }
        function textLengthOf(node) {
            try {
                return String(node?.innerText || node?.textContent || '').trim().length;
            } catch {
                return 0;
            }
        }
        function containsNavigationChrome(node) {
            try {
                return !!node.querySelector?.([
                    'nav',
                    'aside',
                    '[role="navigation"]',
                    '[class*="sidebar" i]',
                    '[class*="sidenav" i]',
                    '[class*="side-panel" i]',
                    '[class*="drawer" i]',
                    '[data-testid*="sidebar" i]',
                    '[data-testid*="nav" i]'
                ].join(','));
            } catch {
                return false;
            }
        }
        function candidatesFor(selectorGroup) {
            try {
                return Array.from(document.querySelectorAll(selectorGroup))
                    .filter((node) => {
                        try {
                            return (
                                node &&
                                node.contains(el) &&
                                visible(node) &&
                                textLengthOf(node) > 0
                            );
                        } catch {
                            return false;
                        }
                    })
                    .sort((a, b) => {
                        const aChrome = containsNavigationChrome(a) ? 1 : 0;
                        const bChrome = containsNavigationChrome(b) ? 1 : 0;
                        if (aChrome !== bChrome) return aChrome - bChrome;
                        /*
                         * Within the same priority tier, choose the smallest
                         * visible container that contains the selected content.
                         * This avoids selecting the sidebar along with the chat pane.
                         */
                        const aArea = areaOf(a);
                        const bArea = areaOf(b);
                        if (aArea !== bArea) return aArea - bArea;
                        return textLengthOf(b) - textLengthOf(a);
                    });
            } catch {
                return [];
            }
        }
        const selectorTiers = [
            '[role="log"], [role="feed"], [data-testid*="message-list" i]',
            '[class*="conversation" i], [class*="chat-messages" i], [class*="messages" i]',
            '#__next main, main[class*="chat" i], [data-testid="chat-container"]',
            '[role="main"], main'
        ];
        for (const selectorGroup of selectorTiers) {
            const matches = candidatesFor(selectorGroup);
            if (matches[0]) return matches[0];
        }
        return el;
    }

    const paneRoot = findPaneRoot(best.el);

    // --- Mark the pane root for PDF/print export targeting ---
    if (${markForExportLiteral}) {
        try {
            document.querySelectorAll('[data-pdf-export-target]').forEach(function(el) {
                try { el.removeAttribute('data-pdf-export-target'); } catch(e) {}
            });
            paneRoot.setAttribute('data-pdf-export-target', '1');
        } catch(e) {}
    }

    function cleanCloneHtml(el) {
        try {
            const clone = el.cloneNode(true);
            if (${cleanupJunkLiteral}) {
                try {
                    clone.querySelectorAll(junkSelectors.join(',')).forEach((node) => {
                        try { node.remove(); } catch {}
                    });
                } catch {}
                try {
                    const preserveJoined = preserveSelectors.join(', ');
                    clone.querySelectorAll(preserveJoined).forEach((node) => {
                        try { node.setAttribute('data-preserve', 'true'); } catch {}
                    });
                } catch {}
                try {
                    clone.querySelectorAll('div, span, section').forEach((node) => {
                        try {
                            if (
                                !String(node.textContent || '').trim() &&
                                !node.querySelector('[data-preserve]') &&
                                !node.querySelector('pre, code, table, ul, ol, img, svg, canvas, video, [role="table"], [role="grid"]')
                            ) {
                                node.remove();
                            }
                        } catch {}
                    });
                } catch {}
            }
            return clone.outerHTML;
        } catch {
            try { return el.outerHTML || ''; } catch { return ''; }
        }
    }

    if (${scrollIntoViewLiteral}) {
        try {
            paneRoot.scrollIntoView({ block: 'start', inline: 'nearest' });
        } catch {}
    }

    let selectedTextLength = 0;
    let selectedOk = false;
    if (${selectContentLiteral}) {
        try {
            const selection = window.getSelection?.();
            if (selection) {
                selection.removeAllRanges();
                const range = document.createRange();
                range.selectNodeContents(paneRoot);
                selection.addRange(range);
                selectedTextLength = String(selection.toString() || '').length;
                selectedOk = selectedTextLength > 0;
            }
        } catch {}
    }

    const resultHtml = ${includeHtmlLiteral} ? cleanCloneHtml(${selectContentLiteral} ? paneRoot : best.el) : '';

    return {
        ok: ${selectContentLiteral} ? selectedOk : true,
        selector: best.sel,
        html: resultHtml,
        textLength: Number(best.textLength || 0),
        score: Number(best.score || 0),
        selectedRootTag: paneRoot?.tagName || '',
        selectedRootId: paneRoot?.id || '',
        selectedTextLength
    };
})();
`;
}

// === cleanupDOMFragmentScript ================================================
// Returns renderer-side JS that cleans a cloned DOM fragment.
function cleanupDOMFragmentScript(containerName = 'container') {
    const junkJson = JSON.stringify(DOM_CLEANUP_SELECTORS);
    const preserveJson = JSON.stringify(PRESERVE_SELECTORS);
    return `
(function() {
    const clone = ${containerName};
    if (!clone) return;
    const JUNK = ${junkJson};
    const PRESERVE = ${preserveJson};
    const PRESERVE_JOINED = PRESERVE.join(', ');

    clone.querySelectorAll(JUNK.join(',')).forEach(el => {
        try { el.remove(); } catch {}
    });
    clone.querySelectorAll(PRESERVE_JOINED).forEach(el => {
        try { el.setAttribute('data-preserve', 'true'); } catch {}
    });
    clone.querySelectorAll('[data-preserve]').forEach(el => {
        try {
            el.querySelectorAll('*').forEach(child => child.setAttribute('data-preserve-descendant', 'true'));
        } catch {}
    });
    clone.querySelectorAll('div, span, section').forEach(el => {
        try {
            if (
                !el.textContent.trim() &&
                !el.querySelector(PRESERVE_JOINED) &&
                !el.querySelector('[data-preserve]') &&
                !el.getAttribute('data-preserve-descendant')
            ) {
                el.remove();
            }
        } catch {}
    });
})();
`;
}

// === buildChatPaneDetectionScript ============================================
// Returns JS that detects and selects the chat pane for
// operations like "Select Chat Pane".
function buildChatPaneDetectionScript({
    includeHtml = false,
    cleanupJunk = false,
    selectContent = false,
    scrollIntoView = false
} = {}) {
    return buildLocateChatRootScript({
        includeHtml,
        cleanupJunk,
        selectContent,
        scrollIntoView
    });
}

// ============================================================================
module.exports = {
    CHAT_SELECTOR,
    CHAT_ROOT_SELECTORS,
    CHAT_MESSAGE_LIST_SELECTORS,
    CHAT_SCOPE_SELECTOR,
    CHAT_SCOPE_PSEUDO,
    CHAT_MESSAGE_LIST_SELECTOR,
    CHAT_MESSAGE_LIST_PSEUDO,
    EXPORT_ROOT_CLASS,
    EXPORT_ROOT_SELECTOR,
    CODE_PREVIEW_IFRAME_SELECTOR,
    TRANSCRIPT_SELECTORS,
    DOM_CLEANUP_SELECTORS,
    DOM_PRESERVE_CONTENT_SELECTORS,
    CHROME_PENALTY_SELECTOR,
    CHROME_PENALTY_REGEX,
    USER_PROMPT_SELECTOR,
    USER_PROMPT_REGEX,
    TABLE_SIGNAL_SELECTORS,
    TABLE_SIGNAL_SELECTOR_JOINED,
    TABLE_SIGNAL_HTML_REGEX,
    PROMOTION_STOP_SELECTOR,
    PROMOTION_CANDIDATE_SELECTOR,
    PROMOTION_CANDIDATE_REGEX,
    PRESERVE_SELECTORS,
    PRESERVE_SELECTOR_JOINED,
    messageContentById,
    buildLocateChatRootScript,
    cleanupDOMFragmentScript,
    buildChatPaneDetectionScript,
};
