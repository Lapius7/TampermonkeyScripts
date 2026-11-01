// ==UserScript==
// @name         fx URL copy
// @namespace    https://fx.lapius7.com/
// @version      1.0.0
// @description  Alt+Shift+F で、表示中のページの URL を fx○.lapius7.com 版に書き換えてコピーします。
// @author       狐ノ瀬つづり
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
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
  "use strict";

  /** 他のショートカットと被りにくい Alt+Shift+F（キー配列に依存しない e.code で判定） */
  const isShortcut = (e) => e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyF";

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

  /** 画面の右下に短く表示する */
  function toast(text) {
    const el = document.createElement("div");
    el.textContent = text;
    el.setAttribute("role", "status");
    el.style.cssText =
      "position:fixed;right:16px;bottom:16px;z-index:2147483647;max-width:min(480px,90vw);padding:10px 14px;" +
      "background:#161616;color:#fff;font:500 13px/1.5 system-ui,sans-serif;border:1px solid #444;" +
      "overflow-wrap:anywhere;opacity:0;transition:opacity .15s";
    document.documentElement.appendChild(el);
    requestAnimationFrame(() => (el.style.opacity = "1"));
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, 2000);
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (!isShortcut(e) || e.repeat) return;
      e.preventDefault();
      const url = convert(location.href);
      if (!url) return toast("fx に対応していないページです");
      GM_setClipboard(url, "text");
      toast(`コピーしました: ${url}`);
    },
    true,
  );
})();
