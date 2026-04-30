"use client";

export function PrepHtmlViewer({ html }: { html: string }) {
  return (
    <div
      style={{ lineHeight: 1.7, fontSize: 15, color: 'var(--ink)' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
