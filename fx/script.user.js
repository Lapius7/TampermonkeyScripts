// ==UserScript==
// @name         fx URL copy
// @namespace    https://fx.lapius7.com/
// @version      1.4.0
// @description  ショートカット（初期値は Alt+Shift+F）で、表示中のページの URL を fx○.lapius7.com 版（YouTube は /動画ID の短い形）に書き換えてコピーします。X・YouTube では /m や /jp、?dearrow などのオプションを選べます。
// @author       Lapius
// @homepageURL  https://github.com/Lapius7/TampermonkeyScripts
// @updateURL    https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js
// @downloadURL  https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
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
// @grant        GM_unregisterMenuCommand
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
  "use strict";

  const STORE_KEY = "shortcut";
  const X_RESERVED = new Set(["home", "explore", "search", "settings", "i", "notifications", "messages", "compose", "login", "signup", "tos", "privacy", "hashtag", "intent", "share"]);
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

  /** 元の URL を fx 版に変換する。{ url, kind } を返し、対象外なら null。kind はオプション選択の種類 */
  function convert(href) {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");
    const rest = u.pathname + u.search;
    const out = (url, kind = "") => ({ url, kind });

    if (host === "x.com" || host === "twitter.com" || host === "mobile.twitter.com" || host === "mobile.x.com") {
      // 投稿: /user/status/ID/photo/1 などの付属パスと s=20 などの追跡パラメータを落とす
      const post = /^\/(?:i\/(?:web\/)?|([A-Za-z0-9_]{1,15})\/)status(?:es)?\/(\d+)/.exec(u.pathname);
      if (post) return out(`https://fxx.lapius7.com/${post[1] ?? "i"}/status/${post[2]}`, "xpost");
      // プロフィール: /user/with_replies, /user/media などはプロフィール本体に寄せる
      const prof = /^\/([A-Za-z0-9_]{1,15})(?:\/(?:with_replies|media|highlights|articles|likes|followers|following|verified_followers|photo|header_photo))?\/?$/.exec(u.pathname);
      if (prof && !X_RESERVED.has(prof[1].toLowerCase())) return out(`https://fxx.lapius7.com/${prof[1]}`);
      return out(`https://fxx.lapius7.com${rest}`);
    }

    if (host === "github.com") {
      // #L10-L20 は、サーバーに届かないので ?L10-L20 に置き換える
      const range = /^#(L\d+(?:-L\d+)?)$/.exec(u.hash);
      return out(`https://fxgh.lapius7.com${u.pathname}${range ? `?${range[1]}` : u.search}`);
    }
    if (host === "gist.github.com") return out(`https://fxgh.lapius7.com/gist${rest}`);

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const base = host === "music.youtube.com" ? "https://m.fxyt.lapius7.com" : "https://fxyt.lapius7.com";
      const p = u.pathname;
      const keep = (...names) => {
        const q = new URLSearchParams();
        for (const n of names) if (u.searchParams.get(n)) q.set(n, u.searchParams.get(n));
        const str = q.toString();
        return str ? `?${str}` : "";
      };
      // 動画は /<ID> に縮める。再生位置は残し、si などの追跡は落とす。再生リストつきだけ /watch を残す
      if (p === "/watch") {
        const v = u.searchParams.get("v");
        if (!v) return null;
        if (u.searchParams.get("list")) return out(`${base}/watch${keep("v", "list", "t", "start")}`, "ytvideo");
        return out(`${base}/${v}${keep("t", "start")}`, "ytvideo");
      }
      // ショート・ライブ・埋め込み
      const vid = /^\/(?:shorts|live|embed)\/([^/?#]+)/.exec(p);
      if (vid) return out(`${base}/${vid[1]}${keep("t", "start")}`, "ytvideo");
      if (p === "/playlist") return out(`${base}/playlist${keep("list")}`);
      // チャンネル: /@name/videos /shorts /streams /community などはチャンネル本体に寄せる
      const ch = /^\/(@[^/?#]+|(?:channel|user|c)\/[^/?#]+)/.exec(p);
      if (ch) return out(`${base}/${ch[1]}`);
      return out(`${base}${rest}`);
    }
    if (host === "youtu.be") {
      const m = /^\/([^/?#]+)/.exec(u.pathname);
      const t = u.searchParams.get("t") ?? u.searchParams.get("start");
      return m ? out(`https://fxyt.lapius7.com/${m[1]}${t ? `?t=${t}` : ""}`, "ytvideo") : null;
    }
    return null;
  }

  /** サービスごとの付け足し。items は同時に1つだけ選べる */
  const OPTIONS = {
    xpost: {
      title: "X の表示オプション",
      multi: false,
      items: [
        { key: "", label: "標準" },
        { key: "d", label: "/d", note: "本文を省き、メディアを大きく表示" },
        { key: "m", label: "/m", note: "複数画像を1枚にまとめる" },
        { key: "g", label: "/g", note: "最小限の表示" },
        { key: "t", label: "/t", note: "テキストのみ" },
        { key: ".mp4", label: ".mp4", note: "動画ファイルそのもの" },
        { key: ".jpg", label: ".jpg", note: "画像ファイルそのもの" },
        { key: "jp", label: "/jp", note: "日本語に翻訳" },
        { key: "en", label: "/en", note: "英語に翻訳" },
        { key: "ko", label: "/ko", note: "韓国語に翻訳" },
        { key: "zh", label: "/zh", note: "中国語に翻訳" },
        { key: "es", label: "/es", note: "スペイン語に翻訳" },
        { key: "fr", label: "/fr", note: "フランス語に翻訳" },
        { key: "de", label: "/de", note: "ドイツ語に翻訳" },
      ],
      apply: (url, [k]) => (!k ? url : k.startsWith(".") ? `${url}${k}` : `${url}/${k}`),
    },
    ytvideo: {
      title: "YouTube の表示オプション",
      multi: true,
      items: [
        { key: "dislikes", label: "?dislikes", note: "低評価の数を表示（Return YouTube Dislike）" },
        { key: "dearrow", label: "?dearrow", note: "DeArrow のタイトルとサムネイルに置き換える" },
        { key: "nothumb", label: "?nothumb", note: "サムネイルを付けない" },
        { key: "stock", label: "?stock", note: "YouTube 公式のプレーヤーで埋め込む" },
        { key: "direct", label: "?direct", note: "動画ファイル（mp4）へ直接移動する" },
      ],
      apply: (url, keys) => (keys.length ? `${url}${url.includes("?") ? "&" : "?"}${keys.join("&")}` : url),
    },
  };

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
    .picker { position: fixed; align-items: flex-start; }
    .grow { flex: 1; min-width: 0; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .chip { height: 28px; padding: 0 10px; font: 500 12px/18px ui-monospace, "SF Mono", Menlo, Consolas, monospace; border-radius: 7px; }
    .chip[aria-pressed="true"] { color: var(--bg); background: var(--fg); border-color: var(--fg); }
    .picker .hint { margin-top: 8px; font-size: 12px; }
    .x { flex: none; width: 26px; height: 26px; padding: 0; line-height: 1; border: 0; font-size: 18px; color: var(--sub); }
    @media (prefers-reduced-motion: reduce) { .toast, .overlay, .dialog { transition: none; } .bar { animation: none; display: none; } }
  `;

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

  /** innerHTML は YouTube などの Trusted Types で拒否されるので、DOM を直接組み立てる */
  const SVG_TAGS = new Set(["svg", "circle", "path"]);
  function h(tag, props, ...kids) {
    const el = SVG_TAGS.has(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(props ?? {})) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  const icon = (isError) =>
    h("svg", { class: "icon", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" },
      h("circle", { cx: 10, cy: 10, r: 8 }),
      h("path", { d: isError ? "M10 6v4.5M10 13.5v.01" : "m6.5 10.2 2.5 2.5 4.5-5" }));

  let toastTimer;
  let toastUi;
  function closeToast() {
    clearTimeout(toastTimer);
    toastUi?.host.remove();
    toastUi = null;
  }
  function toast(title, detail, isError = false) {
    closeToast();
    const ui = (toastUi = mount());
    const duration = isError ? 2800 : 2400;
    const el = h("div", { class: `toast${isError ? " error" : ""}`, role: "status", "aria-live": "polite", style: `--dur:${duration}ms` },
      icon(isError),
      h("div", null, h("div", { class: "title" }, title), detail ? h("div", { class: "url" }, detail) : null),
      h("span", { class: "bar" }));
    ui.wrap.append(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => ui.host.remove(), 220);
    }, duration);
  }

  /** コピー後に出すパネル。オプションを選ぶたびにそのURLをコピーし直す */
  function openPicker(base) {
    const spec = OPTIONS[base.kind];
    closeToast();
    const ui = (toastUi = mount());
    const sel = new Set(spec.multi ? [] : [""]);
    const urlEl = h("div", { class: "url" }, base.url);
    const chips = spec.items.map((it) =>
      h("button", { type: "button", class: "chip", "aria-pressed": String(sel.has(it.key)), title: it.note ?? "", onclick: () => select(it.key) }, it.label));
    const close = () => {
      document.removeEventListener("keydown", onKey, true);
      panel.classList.remove("show");
      setTimeout(() => ui.host.remove(), 220);
      if (toastUi === ui) toastUi = null;
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const select = (key) => {
      if (spec.multi) sel.has(key) ? sel.delete(key) : sel.add(key);
      else {
        sel.clear();
        sel.add(key);
      }
      const keys = spec.items.filter((it) => sel.has(it.key) && it.key).map((it) => it.key);
      const url = spec.apply(base.url, keys);
      urlEl.textContent = url;
      spec.items.forEach((it, i) => chips[i].setAttribute("aria-pressed", String(sel.has(it.key))));
      GM_setClipboard(url, "text");
      const it = spec.items.find((i) => i.key === key);
      note.textContent = `コピーしました${it?.note ? `｜${it.label}: ${it.note}` : ""}`;
    };
    const note = h("div", { class: "hint" }, "コピーしました");
    const panel = h("div", { class: "toast picker", role: "dialog", "aria-label": spec.title },
      icon(false),
      h("div", { class: "grow" },
        h("div", { class: "title" }, spec.title),
        urlEl,
        h("div", { class: "chips" }, chips),
        note),
      h("button", { type: "button", class: "x", "aria-label": "閉じる", onclick: close }, "×"));
    ui.wrap.append(panel);
    document.addEventListener("keydown", onKey, true);
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("show")));
  }

  /** ショートカット設定ダイアログ。修飾キーを 1 つ以上含む組み合わせだけ受け付ける */
  let dialogOpen = false;
  function openSettings() {
    if (dialogOpen) return;
    dialogOpen = true;
    const ui = mount();
    let pending = null;
    const overlay = h("div", { class: "overlay" },
      h("div", { class: "dialog", role: "dialog", "aria-modal": "true", "aria-label": "ショートカットの設定" },
        h("h2", null, "ショートカットの設定"),
        h("p", { class: "desc" }, "設定したいキーの組み合わせを押してください。Ctrl・Alt・Shift・Meta のどれかを含めます。"),
        h("div", { class: "keys rec", "aria-live": "polite" }),
        h("p", { class: "msg" }),
        h("div", { class: "actions" },
          h("button", { type: "button", "data-a": "reset" }, "初期値に戻す"),
          h("div", null,
            h("button", { type: "button", "data-a": "cancel" }, "キャンセル"),
            h("button", { type: "button", class: "primary", "data-a": "save", disabled: true }, "保存")))));
    ui.wrap.append(overlay);
    const keys = overlay.querySelector(".keys");
    const msg = overlay.querySelector(".msg");
    const save = overlay.querySelector('[data-a="save"]');

    const render = (s, recording) => {
      keys.classList.toggle("rec", recording);
      keys.replaceChildren(...(s ? parts(s).map((p) => h("kbd", null, p)) : [h("span", { class: "hint" }, "キーを押してください…")]));
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
        refreshMenu();
        close();
        toast("ショートカットを保存しました", parts(pending).join("+"));
      }
    });
    document.addEventListener("keydown", onKey, true);
    render(null, true);
    requestAnimationFrame(() => overlay.classList.add("show"));
  }

  /* ---------- 本体 ---------- */

  const label = () => parts(loadShortcut()).join("+");
  const menuIds = [];

  /** メニューの表示は登録時に決まるので、設定が変わるたびに登録し直す */
  function refreshMenu() {
    while (menuIds.length) {
      try {
        GM_unregisterMenuCommand(menuIds.pop());
      } catch {}
    }
    menuIds.push(
      GM_registerMenuCommand(`ショートカットを変更（現在: ${label()}）`, openSettings),
      GM_registerMenuCommand("ショートカットを初期値に戻す", () => {
        GM_setValue(STORE_KEY, DEFAULT_SHORTCUT);
        refreshMenu();
        toast("ショートカットを初期値に戻しました", label());
      }),
    );
  }
  refreshMenu();

  document.addEventListener(
    "keydown",
    (e) => {
      if (dialogOpen || e.repeat || !matches(e, loadShortcut())) return;
      e.preventDefault();
      const r = convert(location.href);
      if (!r) return toast("fx に対応していないページです", location.hostname, true);
      GM_setClipboard(r.url, "text");
      if (OPTIONS[r.kind]) openPicker(r);
      else toast("コピーしました", r.url);
    },
    true,
  );
})();
