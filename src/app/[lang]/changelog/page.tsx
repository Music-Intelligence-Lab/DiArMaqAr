import React from "react";
import Footer from "@/components/footer";
import { ChangelogBlock, ChangelogInline, getChangelog } from "@/functions/changelog";
import { SITE_URL } from "@/site";
import "@/styles/changelog.scss";

// Built once from CHANGELOG.md at build time, like the rest of the static pages
export const dynamic = "force-static";

// Western digits, day month year: "21 July 2026"
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * CHANGELOG.md links to the archive by its full address so the links also work
 * on GitHub. On the page they become local, in the reader's language
 * (https://diarmaqar.net/en/statistics → /ar/statistics on the Arabic page).
 */
function localHref(href: string, lang: string): string {
  if (!href.startsWith(SITE_URL + "/")) return href;
  return href.slice(SITE_URL.length).replace(/^\/(en|ar|fr)(?=\/|$)/, `/${lang}`);
}

function Inlines({ inlines, lang }: { inlines: ChangelogInline[]; lang: string }) {
  return (
    <>
      {inlines.map((inline, i) =>
        inline.kind === "strong" ? (
          <strong key={i}>{inline.text}</strong>
        ) : inline.kind === "link" ? (
          // The documentation is its own static site, so every link is a plain one;
          // only links that leave the archive open in a new tab
          <a key={i} href={localHref(inline.href, lang)} {...(/^https?:/.test(localHref(inline.href, lang)) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {inline.text}
          </a>
        ) : (
          <React.Fragment key={i}>{inline.text}</React.Fragment>
        )
      )}
    </>
  );
}

function Blocks({ blocks, lang }: { blocks: ChangelogBlock[]; lang: string }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.kind === "section" ? (
          <h3 key={i} className="changelog__section">
            {block.title}
          </h3>
        ) : block.kind === "paragraph" ? (
          <p key={i}>
            <Inlines inlines={block.inlines} lang={lang} />
          </p>
        ) : (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inlines inlines={item} lang={lang} />
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}

/** Major features and data additions, newest first, from CHANGELOG.md. */
export default async function ChangelogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { intro, entries } = getChangelog();
  return (
    <div className="main-content changelog">
      <div className="changelog__body">
        <h1 className="changelog__title">Change Log</h1>
        <div className="changelog__intro">
          <Blocks blocks={intro} lang={lang} />
        </div>
        {entries.map((entry) => (
          <article key={`${entry.date}-${entry.title}`} className="changelog__entry">
            <time className="changelog__date" dateTime={entry.date}>
              {formatDate(entry.date)}
            </time>
            <h2 className="changelog__entry-title">{entry.title}</h2>
            <div className="changelog__entry-body">
              <Blocks blocks={entry.blocks} lang={lang} />
            </div>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}
