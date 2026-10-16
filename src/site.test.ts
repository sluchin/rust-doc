/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { isDocUrl, tabIndexOf } from "../shared/ts/lib/docUrl";
import { extractPage } from "../shared/ts/lib/extract";
import { parseHtmlMenu } from "../shared/ts/lib/menu";
import { site } from "./site";

/** 作り物の mdBook 風のページ (ドキュメントの文章は使わない). */
const PAGE = `<html><head><title>Sample - The Rust Programming Language</title></head><body>
<nav id="mdbook-sidebar">Side menu</nav>
<div id="mdbook-content"><main><h1 id="sample"><a class="header" href="#sample">Sample</a></h1>
<p>Body text with <a href="other.html#part">a link</a>.</p>
<pre class="playground"><code class="language-rust"><span class="boring">fn main() {
</span>let x = 1;
<span class="boring">}</span></code></pre>
<p><label class="checkbox-label"><input class="checkbox-img" type="checkbox"><img src="img/pic.svg" alt="pic"><span class="img-wrapper"><img src="img/pic.svg" alt="pic"></span></label></p>
<button>Copy</button></main><nav class="nav-wrapper">Prev next</nav></div></body></html>`;

/** 作り物の mdBook 風の目次 (`toc.html`). */
const TOC = `<html><body class="sidebar-iframe-inner"><ol class="chapter">
<li class="chapter-item"><span class="chapter-link-wrapper"><a href="title-page.html">Title</a></span></li>
<li class="chapter-item"><span class="chapter-link-wrapper"><a href="ch01.html"><strong>1.</strong> First</a></span><ol class="section">
<li class="chapter-item"><span class="chapter-link-wrapper"><a href="ch01-01.html"><strong>1.1.</strong> Sub</a></span></li></ol>
<li class="part-title">Part</li><li class="spacer"></li>
<li class="chapter-item"><span class="chapter-link-wrapper"><a href="ch02.html">Second</a></span></li></ol></body></html>`;

describe("Rust site profile", () => {
  it("opens only the pages of the two documents, starting from the first tab", () => {
    expect(site.tabs).toHaveLength(2);
    expect(isDocUrl(site.homeUrl, site)).toBe(true);
    for (const tab of site.tabs ?? []) {
      expect(isDocUrl(tab.homeUrl, site)).toBe(true);
      expect(tab.homeUrl.startsWith(`https://${site.host}${tab.pathPrefix}`)).toBe(true);
    }
    // 同じホストの、ほかのドキュメント (標準ライブラリのリファレンスなど) は、アプリでは開かない
    expect(isDocUrl("https://doc.rust-lang.org/std/index.html", site)).toBe(false);
    expect(isDocUrl("https://doc.rust-lang.org/reference/index.html", site)).toBe(false);
    expect(isDocUrl("https://example.com/stable/book/", site)).toBe(false);
  });

  it("finds the tab of a page", () => {
    const tabs = site.tabs ?? [];
    expect(tabIndexOf("https://doc.rust-lang.org/stable/book/ch01-00.html", tabs)).toBe(0);
    expect(tabIndexOf("https://doc.rust-lang.org/nomicon/data.html", tabs)).toBe(1);
  });

  it("takes the main content, strips the site name and drops the hidden lines and buttons", () => {
    const page = extractPage(PAGE, "https://doc.rust-lang.org/stable/book/sample.html", site);
    expect(page.title).toBe("Sample");
    expect(page.html).toContain("Body text");
    expect(page.html).toContain("let x = 1;");
    expect(page.html).not.toContain("fn main()");
    expect(page.html).not.toContain("Side menu");
    expect(page.html).not.toContain("Copy");
    expect(page.html).not.toContain("<input");
    expect(page.html.match(/<img/g)).toHaveLength(1);
    expect(page.html).toContain('href="https://doc.rust-lang.org/stable/book/other.html#part"');
  });

  it("strips the name of the other document from the title too", () => {
    const page = extractPage(
      "<html><head><title>Data - The Rustonomicon</title></head><body><main><p>x</p></main></body></html>",
      "https://doc.rust-lang.org/nomicon/data.html",
      site,
    );
    expect(page.title).toBe("Data");
  });

  it("reads the menu of each document from its toc.html", () => {
    for (const tab of site.tabs ?? []) {
      expect(tab.menu?.type).toBe("htmlFile");
      if (tab.menu?.type === "htmlFile") {
        expect(tab.menu.url).toBe(`https://doc.rust-lang.org${tab.pathPrefix}toc.html`);
        const body = new DOMParser()
          .parseFromString(TOC, "text/html")
          .querySelector(tab.menu.selector);
        const items = parseHtmlMenu(body as Element, tab.menu.url, tab.menu.list);
        expect(items.map((item) => item.title)).toEqual(["Title", "1. First", "Part", "Second"]);
        expect(items[1].url).toBe(`https://doc.rust-lang.org${tab.pathPrefix}ch01.html`);
        expect(items[1].children.map((child) => child.title)).toEqual(["1.1. Sub"]);
      }
    }
  });
});
