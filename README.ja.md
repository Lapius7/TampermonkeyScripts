<div align="center">

<p align="center">
  <img src="docs/images/banner.png" alt="Tampermonkey Scripts" width="100%">
</p>

<p align="center"><a href="README.md">English</a> | <b>日本語</b></p>

<h1 align="center">Tampermonkey Scripts</h1>

<h3 align="center">Tampermonkey で使う自作ユーザースクリプトの置き場です。</h3>

<p align="center">1スクリプトにつき1ディレクトリで、本体は <code>&lt;名前&gt;/script.user.js</code> に置いています。</p>

<p align="center">
  <a href="https://www.tampermonkey.net/"><img alt="Tampermonkey" src="https://img.shields.io/badge/userscript-Tampermonkey-00485b?style=flat-square&logo=tampermonkey&logoColor=white"></a>
  <a href="https://github.com/Lapius7/TampermonkeyScripts/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Lapius7/TampermonkeyScripts?style=flat-square&color=e3b341&logo=github"></a>
  <a href="https://github.com/Lapius7/TampermonkeyScripts/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/Lapius7/TampermonkeyScripts?label=last%20commit&style=flat-square&color=2f81f7"></a>
</p>

<p align="center"><a href="#スクリプト">スクリプト</a> · <a href="#インストール方法">インストール方法</a> · <a href="#fx">fx</a> · <a href="#スクリプトを足すには">スクリプトを足すには</a></p>

</div>

---

## スクリプト

| スクリプト | 内容 | インストール |
| --- | --- | --- |
| [fx](fx/script.user.js) | ショートカット（初期値 `Alt+Shift+F`）で、表示中のページの URL を `fx○.lapius7.com` 版に書き換えてコピーします。 | [インストール](https://raw.githubusercontent.com/Lapius7/TampermonkeyScripts/main/fx/script.user.js) |

## Fx サービスについて

[Fx](https://fx.lapius7.com/) は X・GitHub・YouTube などのリンクを `fx○.lapius7.com` 形式の URL に置き換えて共有できるサービスです。fx スクリプトは、表示中のページの URL をこの形式に書き換えてコピーします。

- サービス: https://fx.lapius7.com/

## インストール方法

1. ブラウザに [Tampermonkey](https://www.tampermonkey.net/) を入れます。
2. 次のリンクを開きます。Tampermonkey が入っていれば、インストール画面が自動で開くので、「インストール」を押します。

   [https://github.com/Lapius7/TampermonkeyScripts/raw/refs/heads/main/fx/script.user.js](https://github.com/Lapius7/TampermonkeyScripts/raw/refs/heads/main/fx/script.user.js)

3. 更新は Tampermonkey が `@updateURL` を見て自動で取り込みます。手動で確かめるときは、ダッシュボードの「最終更新」を押してください。

> [!TIP]
> インストール画面が出ない場合は、ダッシュボードで「新規スクリプト」を開き、`script.user.js` の中身を貼り付けて保存してください。この方法では自動更新が働くよう、先頭の `@updateURL` と `@downloadURL` を残します。

## fx

`x.com`、`github.com`、`youtube.com` などのページでショートカット（初期値は `Alt+Shift+F`）を押すと、そのページの URL を対応する fx サービスの URL に書き換えてコピーします。Discord などに貼ると、埋め込みで展開されます。

<details>
<summary>URL の例</summary>

| 元の URL | コピーされる URL |
| --- | --- |
| `https://x.com/jack/status/20` | `https://fxx.lapius7.com/jack/status/20` |
| `https://github.com/o/r/blob/main/a.ts#L10-L20` | `https://fxgh.lapius7.com/o/r/blob/main/a.ts?L10-L20` |
| `https://gist.github.com/user/id` | `https://fxgh.lapius7.com/gist/user/id` |
| `https://www.youtube.com/watch?v=HVGR2_9FfU8` | `https://fxyt.lapius7.com/HVGR2_9FfU8` |
| `https://youtu.be/HVGR2_9FfU8` | `https://fxyt.lapius7.com/HVGR2_9FfU8` |
| `https://music.youtube.com/watch?v=ID` | `https://m.fxyt.lapius7.com/watch?v=ID` |

</details>

X の投稿と YouTube の動画では、コピー後にパネルが開きます。オプションを選ぶと、それを付けた URL をコピーし直します。X は `/d`・`/m`・`/g`・`/t`・`.mp4`・`.jpg` と、`/jp` などの翻訳、YouTube は `?dislikes`・`?dearrow`・`?nothumb`・`?stock`・`?direct` を選べます。

### ショートカットの変更

Tampermonkey のアイコンを開き、fx のメニューから「ショートカットを変更」を選びます。設定したいキーの組み合わせを押して「保存」を押すと、すぐ反映されます。Ctrl・Alt・Shift・Meta のどれかを含める必要があります。「初期値に戻す」で `Alt+Shift+F` に戻せます。設定は Tampermonkey に保存され、スクリプトを更新しても消えません。

> [!NOTE]
> この README の作り直しではスクリプトのコードを読んで内容を照合しました。ブラウザでの動作は改めて確認していません。

## スクリプトを足すには

`<名前>/script.user.js` を作り、メタデータに `@updateURL` と `@downloadURL` を書きます。変更したら `@version` を上げてください。上げないと、既存の利用者に更新が届きません。
