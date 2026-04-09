"use client";

import React from "react";

const MD_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const RAW_URL_REGEX = /https?:\/\/[^\s]+/g;
const TRAILING_PUNCTUATION_REGEX = /[)\].,!?;:]+$/;

const splitTrailingPunctuation = (url: string) => {
  const match = url.match(TRAILING_PUNCTUATION_REGEX);
  if (!match) return { href: url, trailing: "" };
  const trailing = match[0];
  const href = url.slice(0, -trailing.length);
  return { href, trailing };
};

export const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    MD_LINK_REGEX.lastIndex = cursor;
    RAW_URL_REGEX.lastIndex = cursor;

    const mdMatch = MD_LINK_REGEX.exec(text);
    const rawMatch = RAW_URL_REGEX.exec(text);

    const next =
      mdMatch && rawMatch
        ? mdMatch.index <= rawMatch.index
          ? { kind: "md" as const, match: mdMatch }
          : { kind: "raw" as const, match: rawMatch }
        : mdMatch
        ? { kind: "md" as const, match: mdMatch }
        : rawMatch
        ? { kind: "raw" as const, match: rawMatch }
        : null;

    if (!next) {
      nodes.push(text.slice(cursor));
      break;
    }

    const { index } = next.match;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    if (next.kind === "md") {
      const [, label, href] = next.match;
      nodes.push(
        <a
          key={`md-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-retro text-lg text-blue underline decoration-dashed underline-offset-4 transition-colors hover:text-purple"
        >
          {label}
        </a>
      );
      cursor = index + next.match[0].length;
      continue;
    }

    const rawUrl = next.match[0];
    const { href, trailing } = splitTrailingPunctuation(rawUrl);

    if (href) {
      nodes.push(
        <a
          key={`raw-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-retro text-lg text-blue underline decoration-dashed underline-offset-4 transition-colors hover:text-purple"
        >
          {href}
        </a>
      );
    } else {
      nodes.push(rawUrl);
    }

    if (trailing) nodes.push(trailing);
    cursor = index + rawUrl.length;
  }

  return <>{nodes}</>;
};
