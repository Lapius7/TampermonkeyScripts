// ==UserScript==
// @name         fx URL copy
// @namespace    https://fx.lapius7.com/
// @version      1.1.0
// @description  ショートカット（初期値は Alt+Shift+F）で、表示中のページの URL を fx○.lapius7.com 版に書き換えてコピーします。ショートカットは Tampermonkey のメニューから変更できます。
// @author       狐ノ瀬つづり
// @homepageURL  https://github.com/Lapius7/TampermonkeyScripts
// @updateURL    https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js
// @downloadURL  https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://music.youtube.com/*
// @match        https://youtu.be/*
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
  "use strict";

  const STORE_KEY = "shortcut";
  const DEFAULT_SHORTCUT = { code: "KeyF", alt: true, shift: true, ctrl: false, meta: false };

  /* ---------- ショートカット ---------- */

  function loadShortcut() {
    const v = GM_getValue(STORE_KEY, null);
    return v && typeof v.code === "string" ? { ...DEFAULT_SHORTCUT, ...v } : DEFAULT_SHORTCUT;
  }

  /** キー配列に依存しないよう e.code で判定する */
  const matches = (e, s) =>
    e.code === s.code && e.altKey === s.alt && e.shiftKey === s.shift && e.ctrlKey === s.ctrl && e.metaKey === s.meta;

  const MODIFIER_CODES = /^(Alt|Shift|Control|Meta|OS)(Left|Right)?$/;

  function codeLabel(code) {
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit\d$/.test(code)) return code.slice(5);
    return code.replace(/^Numpad/, "Num ").replace(/^Arrow/, "");
  }

  function parts(s) {
    return [s.ctrl && "Ctrl", s.alt && "Alt", s.shift && "Shift", s.meta && "Meta", codeLabel(s.code)].filter(Boolean);
  }

  /* ---------- 変換 ---------- */

  /** 元の URL を fx 版に変換する。対象外なら null */
  function convert(href) {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");
    const rest = u.pathname + u.search;

    if (host === "x.com" || host === "twitter.com") return `https://fxx.lapius7.com${rest}`;

    if (host === "github.com") {
      // #L10-L20 は、サーバーに届かないので ?L10-L20 に置き換える
      const range = /^#(L\d+(?:-L\d+)?)$/.exec(u.hash);
      return `https://fxgh.lapius7.com${u.pathname}${range ? `?${range[1]}` : u.search}`;
    }
    if (host === "gist.github.com") return `https://fxgh.lapius7.com/gist${rest}`;

    if (host === "youtube.com" || host === "m.youtube.com") return `https://fxyt.lapius7.com${rest}`;
    if (host === "music.youtube.com") return `https://m.fxyt.lapius7.com${rest}`;
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      const t = u.searchParams.get("t");
      return id ? `https://fxyt.lapius7.com/watch?v=${id}${t ? `&t=${t}` : ""}` : null;
    }
    return null;
  }

  /* ---------- UI（Shadow DOM でページの CSS と分離） ---------- */

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; margin: 0; }
    .root {
      --bg: #ffffff; --fg: #171717; --sub: #6b6b6b; --line: #e4e4e7; --accent: #16a34a; --err: #dc2626; --chip: #f4f4f5;
      font: 400 13px/1.5 system-ui, "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif; color: var(--fg);
    }
    @media (prefers-color-scheme: dark) {
      .root { --bg: #1c1c1f; --fg: #fafafa; --sub: #a1a1aa; --line: #333338; --accent: #4ade80; --err: #f87171; --chip: #2a2a2e; }
    }
    .toast {
      position: fixed; right: 20px; bottom: 20px; z-index: 2147483647; display: flex; align-items: flex-start; gap: 10px;
      width: min(380px, calc(100vw - 40px)); padding: 12px 14px; background: var(--bg); border: 1px solid var(--line);
      border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,.18), 0 1px 3px rgba(0,0,0,.12);
      opacity: 0; transform: translateY(8px) scale(.98); transition: opacity .18s ease, transform .18s ease;
    }
    .toast.show { opacity: 1; transform: none; }
    .icon { flex: none; width: 20px; height: 20px; margin-top: 1px; color: var(--accent); }
    .toast.error .icon { color: var(--err); }
    .title { font-weight: 600; }
    .url { margin-top: 2px; color: var(--sub); font: 12px/1.5 ui-monospace, "SF Mono", Menlo, Consolas, monospace; overflow-wrap: anywhere;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .bar { position: absolute; left: 12px; right: 12px; bottom: 0; height: 2px; border-radius: 2px; background: var(--accent);
      transform-origin: left; animation: shrink var(--dur, 2400ms) linear forwards; }
    .toast.error .bar { background: var(--err); }
    @keyframes shrink { to { transform: scaleX(0); } }

    .overlay { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; background: rgba(0,0,0,.45);
      opacity: 0; transition: opacity .15s ease; }
    .overlay.show { opacity: 1; }
    .dialog { width: min(400px, calc(100vw - 40px)); padding: 20px; background: var(--bg); border: 1px solid var(--line);
      border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,.3); transform: translateY(6px); transition: transform .15s ease; }
    .overlay.show .dialog { transform: none; }
    h2 { font-size: 15px; font-weight: 600; }
    .desc { margin-top: 4px; color: var(--sub); }
    .keys { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: 52px; margin-top: 16px; padding: 10px 12px;
      border: 1px dashed var(--line); border-radius: 10px; background: var(--chip); }
    .keys.rec { border-color: var(--accent); }
    kbd { padding: 3px 8px; font: 600 12px/1.4 ui-monospace, "SF Mono", Menlo, Consolas, monospace; background: var(--bg);
      border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 6px; }
    .hint { color: var(--sub); }
    .msg { min-height: 20px; margin-top: 8px; color: var(--err); font-size: 12px; }
    .actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 12px; }
    .actions div { display: flex; gap: 8px; }
    button { height: 34px; padding: 0 14px; font: 500 13px/20px system-ui, "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif; color: var(--fg); background: transparent;
      border: 1px solid var(--line); border-radius: 8px; cursor: pointer; }
    button:hover { background: var(--chip); }
    button.primary { color: var(--bg); background: var(--fg); border-color: var(--fg); }
    button.primary:hover { opacity: .88; }
    button:disabled { opacity: .4; cursor: default; }
    @media (prefers-reduced-motion: reduce) { .toast, .overlay, .dialog { transition: none; } .bar { animation: none; display: none; } }
  `;

  const ICON_OK =
    '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="m6.5 10.2 2.5 2.5 4.5-5"/></svg>';
  const ICON_ERR =
    '<svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4.5M10 13.5v.01"/></svg>';

  function mount() {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = document.createElement("div");
    wrap.className = "root";
    root.append(style, wrap);
    document.documentElement.appendChild(host);
    return { host, wrap };
  }

  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  let toastTimer;
  let toastUi;
  function toast(title, detail, isError = false) {
    toastUi?.host.remove();
    clearTimeout(toastTimer);
    const ui = (toastUi = mount());
    const duration = isError ? 2800 : 2400;
    ui.wrap.innerHTML =
      `<div class="toast${isError ? " error" : ""}" role="status" aria-live="polite" style="--dur:${duration}ms">` +
      `${isError ? ICON_ERR : ICON_OK}<div><div class="title">${esc(title)}</div>` +
      `${detail ? `<div class="url">${esc(detail)}</div>` : ""}</div><span class="bar"></span></div>`;
    const el = ui.wrap.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => ui.host.remove(), 220);
    }, duration);
  }

  /** ショートカット設定ダイアログ。修飾キーを 1 つ以上含む組み合わせだけ受け付ける */
  let dialogOpen = false;
  function openSettings() {
    if (dialogOpen) return;
    dialogOpen = true;
    const ui = mount();
    let pending = null;
    ui.wrap.innerHTML =
      `<div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-label="ショートカットの設定">` +
      `<h2>ショートカットの設定</h2>` +
      `<p class="desc">設定したいキーの組み合わせを押してください。Ctrl・Alt・Shift・Meta のどれかを含めます。</p>` +
      `<div class="keys rec" aria-live="polite"></div><p class="msg"></p>` +
      `<div class="actions"><button type="button" data-a="reset">初期値に戻す</button>` +
      `<div><button type="button" data-a="cancel">キャンセル</button><button type="button" class="primary" data-a="save" disabled>保存</button></div></div>` +
      `</div></div>`;
    const overlay = ui.wrap.firstElementChild;
    const keys = overlay.querySelector(".keys");
    const msg = overlay.querySelector(".msg");
    const save = overlay.querySelector('[data-a="save"]');

    const render = (s, recording) => {
      keys.classList.toggle("rec", recording);
      keys.innerHTML = s
        ? parts(s).map((p) => `<kbd>${esc(p)}</kbd>`).join("")
        : '<span class="hint">キーを押してください…</span>';
    };
    const close = () => {
      document.removeEventListener("keydown", onKey, true);
      overlay.classList.remove("show");
      setTimeout(() => {
        ui.host.remove();
        dialogOpen = false;
      }, 180);
    };
    const onKey = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape" && !e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) return close();
      if (MODIFIER_CODES.test(e.code)) return; // 修飾キー単独では確定しない
      if (!(e.altKey || e.shiftKey || e.ctrlKey || e.metaKey)) {
        msg.textContent = "修飾キー（Ctrl・Alt・Shift・Meta）を 1 つ以上含めてください。";
        return;
      }
      msg.textContent = "";
      pending = { code: e.code, alt: e.altKey, shift: e.shiftKey, ctrl: e.ctrlKey, meta: e.metaKey };
      render(pending, false);
      save.disabled = false;
    };
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) return close();
      const a = e.target.closest?.("[data-a]")?.dataset.a;
      if (a === "cancel") close();
      if (a === "reset") {
        pending = { ...DEFAULT_SHORTCUT };
        msg.textContent = "";
        render(pending, false);
        save.disabled = false;
      }
      if (a === "save" && pending) {
        GM_setValue(STORE_KEY, pending);
        close();
        toast("ショートカットを保存しました", parts(pending).join(" + "));
      }
    });
    document.addEventListener("keydown", onKey, true);
    render(null, true);
    requestAnimationFrame(() => overlay.classList.add("show"));
  }

  /* ---------- 本体 ---------- */

  GM_registerMenuCommand("ショートカットを変更", openSettings);
  GM_registerMenuCommand("ショートカットを初期値に戻す", () => {
    GM_setValue(STORE_KEY, DEFAULT_SHORTCUT);
    toast("ショートカットを初期値に戻しました", parts(DEFAULT_SHORTCUT).join(" + "));
  });

  document.addEventListener(
    "keydown",
    (e) => {
      if (dialogOpen || e.repeat || !matches(e, loadShortcut())) return;
      e.preventDefault();
      const url = convert(location.href);
      if (!url) return toast("fx に対応していないページです", location.hostname, true);
      GM_setClipboard(url, "text");
      toast("コピーしました", url);
    },
    true,
  );
})();
