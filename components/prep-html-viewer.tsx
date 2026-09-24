"use client";

import { useMemo } from "react";

/**
 * Renders n8n-generated interview-prep HTML inside a sandboxed iframe so that
 * scripts and same-origin access are blocked. The HTML can include user-
 * controllable fields (interviewer names, LinkedIn URLs) that arrive via
 * untrusted text generation, so we never inject it into our own DOM tree.
 */
export function PrepHtmlViewer({ html }: { html: string }) {
  const wrapped = useMemo(() => wrapWithBaseStyles(html), [html]);

  return (
    <iframe
      title="Interview preparation document"
      sandbox=""
      srcDoc={wrapped}
      // A paper page on the dark desk: the guide is a printable document,
      // and matches the PDF it downloads as.
      className="block h-[80dvh] min-h-[640px] w-full rounded-lg border border-line bg-[#f7f5f0]"
    />
  );
}

function wrapWithBaseStyles(html: string): string {
  // The iframe is isolated, so we have to ship the typography it needs inline.
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<base target="_blank" />
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    padding: clamp(20px, 5vw, 56px);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    font-size: 15px;
    line-height: 1.7;
    color: #1c1b19;
    background: #f7f5f0;
    max-width: 72ch;
    margin: 0 auto;
  }
  h1, h2, h3 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; }
  a { color: #9a6a1a; }
  pre, code { font-family: ui-monospace, SFMono-Regular, monospace; }
  img { max-width: 100%; }
</style>
</head>
<body>${html}</body>
</html>`;
}
