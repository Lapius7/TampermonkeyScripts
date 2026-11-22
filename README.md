<div align="center">

<p align="center"><b>English</b> | <a href="README.ja.md">日本語</a></p>

<h1 align="center">Tampermonkey Scripts</h1>

<h3 align="center">My own userscripts for Tampermonkey.</h3>

<p align="center">One directory per script. Each script lives at <code>&lt;name&gt;/script.user.js</code>.</p>

<p align="center">
  <a href="https://www.tampermonkey.net/"><img alt="Tampermonkey" src="https://img.shields.io/badge/userscript-Tampermonkey-00485b?style=flat-square&logo=tampermonkey&logoColor=white"></a>
  <a href="https://github.com/Lapius7/TampermonkeyScripts/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Lapius7/TampermonkeyScripts?style=flat-square&color=e3b341&logo=github"></a>
  <a href="https://github.com/Lapius7/TampermonkeyScripts/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/Lapius7/TampermonkeyScripts?label=last%20commit&style=flat-square&color=2f81f7"></a>
</p>

<p align="center"><a href="#scripts">Scripts</a> · <a href="#install">Install</a> · <a href="#fx">fx</a> · <a href="#adding-a-script">Adding a script</a></p>

</div>

---

## Scripts

| Script | Description | Install |
| --- | --- | --- |
| [fx](fx/script.user.js) | Press a shortcut (default `Alt+Shift+F`) to copy the current page's URL rewritten to its `fx○.lapius7.com` form. | [Install](https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js) |

## About the Fx service

[Fx](https://fx.lapius7.com/) rewrites links from X, GitHub, YouTube and others into `fx○.lapius7.com` URLs so they can be shared. The fx script rewrites the page you are on into that form and copies it.

- Service: https://fx.lapius7.com/

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open the link below. If Tampermonkey is installed, the install screen opens automatically. Press "Install".

   [https://github.com/Lapius7/TampermonkeyScripts/raw/refs/heads/main/fx/script.user.js](https://github.com/Lapius7/TampermonkeyScripts/raw/refs/heads/main/fx/script.user.js)

3. Tampermonkey picks up updates by itself through `@updateURL`. To check by hand, press "Last updated" in the dashboard.

> [!TIP]
> If the install screen does not open, create a new script in the dashboard, paste the contents of `script.user.js`, and save. Keep `@updateURL` and `@downloadURL` at the top so auto-update keeps working.

## fx

On pages such as `x.com`, `github.com` and `youtube.com`, press the shortcut (default `Alt+Shift+F`). The page URL is rewritten to the matching fx service URL and copied. Pasted into Discord and similar apps, it unfurls as an embed.

<details>
<summary>URL examples</summary>

| Original URL | Copied URL |
| --- | --- |
| `https://x.com/jack/status/20` | `https://fxx.lapius7.com/jack/status/20` |
| `https://github.com/o/r/blob/main/a.ts#L10-L20` | `https://fxgh.lapius7.com/o/r/blob/main/a.ts?L10-L20` |
| `https://gist.github.com/user/id` | `https://fxgh.lapius7.com/gist/user/id` |
| `https://www.youtube.com/watch?v=HVGR2_9FfU8` | `https://fxyt.lapius7.com/HVGR2_9FfU8` |
| `https://youtu.be/HVGR2_9FfU8` | `https://fxyt.lapius7.com/HVGR2_9FfU8` |
| `https://music.youtube.com/watch?v=ID` | `https://m.fxyt.lapius7.com/watch?v=ID` |

</details>

On X posts and YouTube videos, a panel opens after copying. Choosing an option copies the URL again with it applied. X offers `/d`, `/m`, `/g`, `/t`, `.mp4`, `.jpg` and translation suffixes such as `/jp`. YouTube offers `?dislikes`, `?dearrow`, `?nothumb`, `?stock` and `?direct`.

### Change the shortcut

Open the Tampermonkey icon and choose "ショートカットを変更" (change the shortcut) from the fx menu. Press the key combination you want and press "保存" (save). It takes effect at once. The combination must include Ctrl, Alt, Shift or Meta. "初期値に戻す" (reset) restores `Alt+Shift+F`. The setting is stored in Tampermonkey and survives script updates.

> [!NOTE]
> The script's menu and dialogs are in Japanese. The script has only been checked by reading its code here; running it in a browser was not re-verified for this README.

## Adding a script

Create `<name>/script.user.js` and put `@updateURL` and `@downloadURL` in its metadata. Raise `@version` whenever you change it. Without that, existing users do not receive the update.
