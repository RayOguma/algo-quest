# アルゴクエスト（仮）

かわいいロボット「アルゴくん」がフィールドを動き回り、変数ボックスに値を運んで入れながら、
基本情報技術者試験・科目Bの雰囲気のアルゴリズム問題（処理の追跡）を4択で解くブラウザパズルゲームです。

- ビルド不要・依存ゼロ（HTML / CSS / JavaScript ES Modules のみ）
- 外部CDN・外部フォント・音源ファイルなし（効果音は Web Audio でコード生成）
- 仕様書：[`docs/algoquest-spec.md`](docs/algoquest-spec.md)／判断ログ：[`DECISIONS.md`](DECISIONS.md)

## 起動方法

ES Modules を使うため、`file://` で直接開くのではなくローカルサーバー経由で開いてください。

```sh
cd C:\dev\algoquest-algorithm-game
python3 -m http.server 8000
# Windows で python3 が無い場合: python -m http.server 8000
```

ブラウザで <http://localhost:8000/> を開きます。

GitHub Pages では、このフォルダをそのまま公開すれば動きます（相対パスのみ使用）。

## 遊び方

1. タイトルの「ゲームかいし」→ アルゴくんのあいさつと遊び方（7ページ・スキップ可）→ ステージ一覧
2. ワールドマップでエリア（ジャンル）を選び、エリア画面でレベルを選ぶ（ジャンル内は Lv1 クリアで Lv2 … と順に解放）
3. 処理を読み、4択から答えを選んで「こたえる」
4. 選んだ答えのとおりにアルゴくんが動き、正解なら ○＋ピンポン、誤答なら ×＋ぶっぶー
5. 正解すると解説画面（処理の追跡表・疑似コード・ポイント・再実演）

### キー操作

| キー | 動作 |
|---|---|
| `1`〜`4` | 選択肢を選ぶ |
| `Enter` | こたえる |
| `T` | 日本語 ⇄ 疑似コード 切替 |
| `F` | 2倍速 ON/OFF |
| `S` | スキップ（実演中のみ） |
| `Esc` | 一覧へ戻る |

## フォルダ構成

```
algoquest-algorithm-game/
├─ index.html              # 単一HTML（画面はセクション切替）
├─ css/style.css
├─ docs/algoquest-spec.md  # 仕様書
├─ docs/pseudocode-style.md # 疑似コードの書き方（科目B準拠）
├─ DECISIONS.md            # 仕様にない細部の判断ログ
├─ assets/img/
│  ├─ algokun_stand.png    # 立ち絵（背景透過済み）
│  ├─ algokun_move.png     # 移動絵（背景透過済み）
│  └─ original/            # 提供された元画像（チェッカー柄の背景つき JPEG）
├─ js/
│  ├─ main.js              # エントリポイント
│  ├─ router.js            # show(screen) の自前ルーター
│  ├─ ui.js                # ダイアログ・トースト・○×オーバーレイ
│  ├─ state.js             # セーブ/ロード（localStorage: algoquest.save.v2）
│  ├─ screens/             # title, tutorial, stageList(ワールドマップ), area, quiz, explanation, settings, common
│  ├─ engine/
│  │  ├─ world.js          # 論理状態とイベント適用（DOM非依存・検証と共有）
│  │  ├─ runner.js         # イベントランナー（アニメーション）
│  │  ├─ field.js          # フィールド描画（Canvas）
│  │  ├─ mapArt.js         # ワールドマップのドット絵（コード描画）
│  │  ├─ character.js      # アルゴくん（画像2枚・バウンド・エフェクト）
│  │  ├─ parts.js          # 変数ボックス・クリスタル・台・配列セル（コード描画）
│  │  ├─ effects.js        # パーティクル・吹き出し
│  │  ├─ audio.js          # 効果音（Web Audio）
│  │  └─ varbar.js         # 変数一覧バー
│  └─ data/
│     ├─ genres.js         # 9ジャンル・5レベルの定義
│     ├─ tutorial.js       # 遊び方ページのデータ
│     └─ stages/           # ジャンルごとのステージデータ（var.js, cond.js, …）
└─ tools/
   ├─ validate-stages.mjs  # ステージデータ検証
   └─ remove-bg.py         # キャラ画像の背景透過（チェッカー柄除去）
```

## キャラクター画像の置き場所

- `assets/img/algokun_stand.png`（立ち絵）と `assets/img/algokun_move.png`（移動絵）の2枚だけを使います。ファイル名は固定です。
- 画像は背景が透明な PNG にしてください。背景にチェッカー柄が焼き込まれている場合は次で透過できます（Pillow が必要）。

  ```sh
  python tools/remove-bg.py assets/img/original/algokun_stand_original.jfif assets/img/algokun_stand.png --size 480
  python tools/remove-bg.py assets/img/original/algokun_move_original.jfif  assets/img/algokun_move.png  --size 480
  ```

- 読み込みに失敗した場合は四角いプレースホルダで代替し、コンソールに警告を出します（ゲームは止まりません）。

## ステージデータの検証

```sh
node tools/validate-stages.mjs            # エラーがあれば終了コード1
node tools/validate-stages.mjs --complete # 9ジャンル×5レベルが揃っていることも必須にする（v1.0）
```

選択肢の数・正解の数・行数一致・壁の通り抜け・`line` の範囲・正解/誤答の最終状態・`calc`/`compare` の計算結果などを、
`js/engine/world.js` で実際にイベントを空実行して確かめます。

## ステージ追加手順

1. `js/data/stages/<ジャンルキー>.js` を作る（または既存ファイルに追記）。`export default [ステージ, …]` の形。
   イベントは `js/data/stages/helpers.js` の関数（`line`, `moves`, `spawn`, `takeCopy`, `store`, `lockFail` など）で書けます。
2. `js/data/stages/index.js` に import を追加する。
3. ステージは仕様書 §9.2 のスキーマに従う。疑似コードは `docs/pseudocode-style.md`（科目B準拠）に従う。主な決まり：
   - `id` は `ジャンルキー-レベル`（例 `loop-1`）
   - `program.ja` と `program.code` は行数・インデントを揃える
   - `choices` はちょうど4つ・`correct: true` は1つ。不正解には `wrongFeedback` と、末尾が `fail` の `events`
   - 正解の `events` は省略可（`stage.events` ＋ `success` を再生）
   - 変数を変えるときは必ず「クリスタルを運んでボックスに入れる」イベント（`store`）を使う
   - ボックスや台を操作するとき、アルゴくんは `access` のセル（既定は対象の1つ下）まで自動で歩きます
4. `node tools/validate-stages.mjs` が成功することを確認する。

## セーブデータ

`localStorage` の `algoquest.save.v2` に保存されます（バージョン番号付きJSON）。設定画面から削除できます。
