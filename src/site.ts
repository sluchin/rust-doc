/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SiteProfile } from "../shared/ts/lib/profile";

/** The Rust Programming Language (The Book) のページの URL の先頭. */
const BOOK = "https://doc.rust-lang.org/stable/book/";

/** The Rustonomicon (Nomicon) のページの URL の先頭. */
const NOMICON = "https://doc.rust-lang.org/nomicon/";

/**
 * Rust のドキュメント (doc.rust-lang.org. mdBook で作られている) の設定.
 *
 * The Book と Nomicon を, 画面の上のタブで切り替える. 本文は `main`. 左のメニュー (目次) は,
 * ページの中ではなく, 各ドキュメントの `toc.html` にある (番号つきの一覧 `ol`).
 */
export const site: SiteProfile = {
  name: "Rust Doc",
  host: "doc.rust-lang.org",
  pathPrefix: "/",
  homeUrl: `${BOOK}index.html`,
  contentSelectors: ["main"],
  // 隠れた行 (コードの例の, 初めと終わりの補い) と, ボタンと, 重ねて出す 2 枚目の画像の枠は, 本文ではない
  removeSelectors: [".boring", "button", "input", ".img-wrapper"],
  titleSuffix: / - (The Rust Programming Language|The Rustonomicon)$/,
  tabs: [
    {
      label: "The Book",
      pathPrefix: "/stable/book/",
      homeUrl: `${BOOK}index.html`,
      menu: { type: "htmlFile", url: `${BOOK}toc.html`, selector: "body", list: "ol" },
    },
    {
      label: "Nomicon",
      pathPrefix: "/nomicon/",
      homeUrl: `${NOMICON}index.html`,
      menu: { type: "htmlFile", url: `${NOMICON}toc.html`, selector: "body", list: "ol" },
    },
  ],
};
