// Pulls the latest posts from the ACM-VIT Hashnode blog and writes them to
// src/data/blogs.generated.json, which src/data/blogs.ts imports. This runs as
// the npm `prebuild` step, so each deploy ships whatever was published at build
// time -- nothing is fetched from the visitor's browser.
//
// Hashnode retired free GraphQL API access in May 2026 (reads now need a Pro
// publication), so this reads the public RSS feed instead. Override the source
// with HASHNODE_FEED_URL and the post count with HASHNODE_POST_LIMIT.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src", "data", "blogs.generated.json");

const FEED_URL = process.env.HASHNODE_FEED_URL ?? "https://blog.acmvit.in/rss.xml";
const PUBLICATION_URL = new URL(FEED_URL).origin;
const ARCHIVE_URL = process.env.HASHNODE_ARCHIVE_URL ?? `${PUBLICATION_URL}/archive`;
const LIMIT = Number(process.env.HASHNODE_POST_LIMIT ?? 30);
const WORDS_PER_MINUTE = 200;
// Deploys shouldn't die because the feed hiccuped, but CI can opt into that.
const STRICT = process.argv.includes("--strict");

const HTML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, name) => {
    if (name[0] === "#") {
      const code =
        name[1] === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : whole;
    }
    return HTML_ENTITIES[name.toLowerCase()] ?? whole;
  });
}

function toText(raw) {
  const cdata = raw.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  const inner = cdata ? cdata[1] : raw;
  return decodeEntities(inner.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function pick(item, tagName) {
  const match = item.match(
    new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`)
  );
  return match ? toText(match[1]) : "";
}

function pickMeta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(
      `<meta\\s+(?:name|property)=["']${escaped}["'][^>]*\\scontent=["']([^"']*)["'][^>]*>`,
      "i"
    )
  );
  return match ? decodeEntities(match[1]) : "";
}

function excerpt(text, max = 240) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const trimmed = space > max * 0.6 ? cut.slice(0, space) : cut;
  return `${trimmed.replace(/[\s.,;:!?—–-]+$/, "")}…`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // UTC so the same feed produces the same file on every build machine.
  const pad = (part) => String(part).padStart(2, "0");
  return `${pad(date.getUTCDate())}-${pad(date.getUTCMonth() + 1)}-${date.getUTCFullYear()}`;
}

function cleanAuthor(name) {
  // Bylines usually carry a registration number ("Asha Rao 25BCE1234").
  return name.replace(/\s*\b\d{2}[A-Za-z]{3}\d{4}\b\s*$/, "").trim() || name;
}

function slugOf(link) {
  try {
    return new URL(link).pathname.split("/").filter(Boolean).pop() ?? link;
  } catch {
    return link;
  }
}

function absoluteUrl(link) {
  return new URL(link, PUBLICATION_URL).toString();
}

function parseFeed(xml) {
  // Post bodies are HTML wrapped in CDATA and can contain literal <item> tags,
  // so lift each one out before splitting the feed into entries, leaving behind
  // an index into the list of bodies we pulled.
  const bodies = [];
  const flattened = xml.replace(
    /<content:encoded>([\s\S]*?)<\/content:encoded>/g,
    (_, body) => {
      const text = toText(body);
      bodies.push({ words: text.split(" ").filter(Boolean).length, lead: text.slice(0, 600) });
      return `<postbody>${bodies.length - 1}</postbody>`;
    }
  );

  const posts = [];
  for (const [, item] of flattened.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = pick(item, "title");
    const link = pick(item, "link");
    if (!title || !link) continue;

    // The feed's own <description> is clipped at a fixed length and usually
    // stops mid-word, so cut our own excerpt out of the post text instead.
    const body = bodies[Number(pick(item, "postbody"))] ?? { words: 0, lead: "" };
    const cover = item.match(/<enclosure[^>]*\surl="([^"]+)"/);

    posts.push({
      id: slugOf(link),
      title,
      author: cleanAuthor(pick(item, "dc:creator")) || "ACM-VIT",
      date: formatDate(pick(item, "pubDate")),
      read: `${Math.max(1, Math.round(body.words / WORDS_PER_MINUTE))} min read`,
      image: cover ? cover[1] : "",
      body: excerpt(body.lead || pick(item, "description")),
      link,
    });
  }

  return posts.slice(0, LIMIT);
}

function parseArchive(html) {
  const posts = [];
  const pattern =
    /<a class="flex items-center gap-4 p-4 hover:bg-muted transition-colors group" href="([^"]+)"><time dateTime="([^"]+)"[^>]*>[\s\S]*?<\/time><div[^>]*><h2[^>]*>([\s\S]*?)<\/h2><p[^>]*>([\s\S]*?)<\/p>/g;

  for (const [, href, dateTime, title, author] of html.matchAll(pattern)) {
    const link = absoluteUrl(decodeEntities(href));
    posts.push({
      id: slugOf(link),
      title: toText(title),
      author: cleanAuthor(toText(author)) || "ACM-VIT",
      date: formatDate(dateTime),
      link,
    });
  }

  return posts;
}

function parseArticlePage(html, archivePost) {
  const title = pickMeta(html, "og:title") || archivePost.title;
  const published = pickMeta(html, "article:published_time");
  const readMatch = html.match(/<span>(\d+)(?:<!-- -->)? min read<\/span>/);

  return {
    id: archivePost.id,
    title,
    author: archivePost.author,
    date: formatDate(published) || archivePost.date,
    read: readMatch ? `${readMatch[1]} min read` : "",
    image: pickMeta(html, "og:image"),
    body: excerpt(pickMeta(html, "og:description")),
    link: archivePost.link,
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { accept: "text/html, application/rss+xml, application/xml;q=0.9, */*;q=0.8" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.text();
}

async function fillFromArchive(posts) {
  const byId = new Map(posts.map((post) => [post.id, post]));
  const maxPages = Math.max(2, Math.ceil(LIMIT / 25) + 1);

  for (let page = 1; byId.size < LIMIT && page <= maxPages; page += 1) {
    const archiveUrl = page === 1 ? ARCHIVE_URL : `${ARCHIVE_URL}?page=${page}`;
    const archivePosts = parseArchive(await fetchText(archiveUrl));
    if (!archivePosts.length) break;

    let addedFromPage = false;
    for (const archivePost of archivePosts) {
      if (byId.has(archivePost.id)) continue;

      try {
        const html = await fetchText(archivePost.link);
        byId.set(archivePost.id, parseArticlePage(html, archivePost));
      } catch (error) {
        byId.set(archivePost.id, {
          ...archivePost,
          read: "",
          image: "",
          body: "",
        });
      }

      addedFromPage = true;
      if (byId.size >= LIMIT) break;
    }

    if (!addedFromPage && archivePosts.every((post) => byId.has(post.id))) break;
  }

  return Array.from(byId.values()).slice(0, LIMIT);
}

async function main() {
  const posts = await fillFromArchive(parseFeed(await fetchText(FEED_URL)));
  if (!posts.length) throw new Error(`no posts found in ${FEED_URL}`);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(posts, null, 2)}\n`);
  console.log(`[blogs] wrote ${posts.length} posts from ${FEED_URL}`);
}

try {
  await main();
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  if (STRICT) {
    console.error(`[blogs] ${reason}`);
    process.exit(1);
  }
  console.warn(`[blogs] could not refresh posts: ${reason}`);
  if (existsSync(OUT)) {
    console.warn("[blogs] keeping the posts from the last successful fetch");
  } else {
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, "[]\n");
    console.warn("[blogs] nothing cached, the site will show placeholder cards");
  }
}
