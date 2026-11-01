# TampermonkeyScripts

Tampermonkey のユーザースクリプトをまとめるリポジトリです。1スクリプトにつき1ディレクトリで、本体は `<名前>/script.js` に置きます。

| スクリプト | 内容 |
| --- | --- |
| [fx](fx/script.js) | `Alt+Shift+F` で、表示中のページの URL を `fx○.lapius7.com` 版に書き換えてコピーします。 |

## 使い方

Tampermonkey のダッシュボードで「新規スクリプト」を開き、`script.js` の中身を貼り付けて保存します。

## fx の変換

| 元の URL | コピーされる URL |
| --- | --- |
| `https://x.com/jack/status/20` | `https://fxx.lapius7.com/jack/status/20` |
| `https://github.com/o/r/blob/main/a.ts#L10-L20` | `https://fxgh.lapius7.com/o/r/blob/main/a.ts?L10-L20` |
| `https://gist.github.com/user/id` | `https://fxgh.lapius7.com/gist/user/id` |
| `https://www.youtube.com/watch?v=HVGR2_9FfU8` | `https://fxyt.lapius7.com/watch?v=HVGR2_9FfU8` |
| `https://youtu.be/HVGR2_9FfU8` | `https://fxyt.lapius7.com/watch?v=HVGR2_9FfU8` |
| `https://music.youtube.com/watch?v=ID` | `https://m.fxyt.lapius7.com/watch?v=ID` |
