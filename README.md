# TampermonkeyScripts

[Tampermonkey](https://www.tampermonkey.net/) で使う自作ユーザースクリプトの置き場です。1スクリプトにつき1ディレクトリで、本体は `<名前>/script.user.js` に置いています。

## スクリプト

| スクリプト | 内容 | インストール |
| --- | --- | --- |
| [fx](fx/script.user.js) | ショートカット（初期値 `Alt+Shift+F`）で、表示中のページの URL を `fx○.lapius7.com` 版に書き換えてコピーします。 | [インストール](https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js) |

## Fx サービスについて

[Fx](https://fx.lapius7.com/) は、X・GitHub・YouTube などのリンクを `fx○.lapius7.com` 形式の URL に置き換えて共有できるサービスです。fx スクリプトは、表示中のページの URL をこの形式に書き換えてコピーします。

- サービス: https://fx.lapius7.com/

## インストール方法

1. ブラウザに [Tampermonkey](https://www.tampermonkey.net/) を入れます。
2. 次のリンクを開きます。Tampermonkey が入っていれば、インストール画面が自動で開くので、「インストール」を押します。

   [https://github.com/Lapius7/TampermonkeyScripts/raw/refs/heads/main/fx/script.user.js](https://github.com/Lapius7/TampermonkeyScripts/raw/refs/heads/main/fx/script.user.js)

3. 更新は Tampermonkey が `@updateURL` を見て自動で取り込みます。手動で確かめるときは、ダッシュボードの「最終更新」を押してください。

インストール画面が出ない場合は、ダッシュボードで「新規スクリプト」を開き、`script.user.js` の中身を貼り付けて保存してください。この方法では自動更新が働くよう、先頭の `@updateURL` と `@downloadURL` を残します。

## fx

`x.com`、`github.com`、`youtube.com` などのページでショートカット（初期値は `Alt+Shift+F`）を押すと、そのページの URL を対応する fx サービスの URL に書き換えてコピーします。Discord などに貼ると、埋め込みで展開されます。

| 元の URL | コピーされる URL |
| --- | --- |
| `https://x.com/jack/status/20` | `https://fxx.lapius7.com/jack/status/20` |
| `https://github.com/o/r/blob/main/a.ts#L10-L20` | `https://fxgh.lapius7.com/o/r/blob/main/a.ts?L10-L20` |
| `https://gist.github.com/user/id` | `https://fxgh.lapius7.com/gist/user/id` |
| `https://www.youtube.com/watch?v=HVGR2_9FfU8` | `https://fxyt.lapius7.com/watch?v=HVGR2_9FfU8` |
| `https://youtu.be/HVGR2_9FfU8` | `https://fxyt.lapius7.com/watch?v=HVGR2_9FfU8` |
| `https://music.youtube.com/watch?v=ID` | `https://m.fxyt.lapius7.com/watch?v=ID` |

### ショートカットの変更

Tampermonkey のアイコンを開き、fx のメニューから「ショートカットを変更」を選びます。設定したいキーの組み合わせを押して「保存」を押すと、すぐ反映されます。Ctrl・Alt・Shift・Meta のどれかを含める必要があります。「初期値に戻す」で `Alt+Shift+F` に戻せます。設定は Tampermonkey に保存され、スクリプトを更新しても消えません。

## スクリプトを足すには

`<名前>/script.user.js` を作り、メタデータに `@updateURL` と `@downloadURL` を書きます。変更したら `@version` を上げてください。上げないと、既存の利用者に更新が届きません。
