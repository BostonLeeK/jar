import { renderTemplate, sanitizeCss, splitSlots } from "@/lib/template";
import { Fragment, type ReactNode } from "react";

export function CustomBlock({
  html,
  css,
  vars,
  lists,
}: {
  html: string;
  css: string;
  vars: Record<string, string>;
  lists?: Record<string, Record<string, string>[]>;
}) {
  return (
    <>
      {css ? <style>{sanitizeCss(css)}</style> : null}
      <div dangerouslySetInnerHTML={{ __html: renderTemplate(html, vars, lists) }} />
    </>
  );
}

export function CustomLayout({
  html,
  css,
  vars,
  lists,
  slots,
}: {
  html: string;
  css: string;
  vars: Record<string, string>;
  lists?: Record<string, Record<string, string>[]>;
  slots: Record<string, ReactNode>;
}) {
  const names = Object.keys(slots);
  const rendered = renderTemplate(html, vars, lists, names);
  const parts = splitSlots(rendered, names);
  return (
    <>
      {css ? <style>{sanitizeCss(css)}</style> : null}
      {parts.map((part, index) =>
        part.type === "slot" ? (
          <Fragment key={index}>{slots[part.name]}</Fragment>
        ) : (
          <div key={index} dangerouslySetInnerHTML={{ __html: part.html }} />
        ),
      )}
    </>
  );
}
