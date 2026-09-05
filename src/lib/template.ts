export const TEMPLATE_LIMIT = 24000;

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function sanitizeHtml(input: string) {
  return input
    .replace(/<\/(?:script|iframe|object|embed|link|meta|form|base)\b[^>]*>/gi, "")
    .replace(/<(?:script|iframe|object|embed|link|meta|form|base)\b[\s\S]*?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .slice(0, TEMPLATE_LIMIT);
}

export function sanitizeCss(input: string) {
  return input
    .replace(/<\/style/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/@import/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, "")
    .slice(0, TEMPLATE_LIMIT);
}

export function interpolate(html: string, vars: Record<string, string>, reserved: string[] = []) {
  const keep = new Set(reserved);
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (full, key: string) => {
    if (keep.has(key)) {
      return full;
    }
    return vars[key] ?? "";
  });
}

export function renderEach(html: string, name: string, items: Record<string, string>[]) {
  const pattern = new RegExp(`\\{\\{\\s*#each\\s+${name}\\s*\\}\\}([\\s\\S]*?)\\{\\{\\s*/each\\s*\\}\\}`, "g");
  return html.replace(pattern, (_match, inner: string) => items.map((item) => interpolate(inner, item)).join(""));
}

export function renderTemplate(
  html: string,
  vars: Record<string, string>,
  lists: Record<string, Record<string, string>[]> = {},
  reserved: string[] = [],
) {
  let out = sanitizeHtml(html);
  for (const [name, items] of Object.entries(lists)) {
    out = renderEach(out, name, items);
  }
  return interpolate(out, vars, reserved);
}

export type TemplatePart = { type: "html"; html: string } | { type: "slot"; name: string };

export function splitSlots(html: string, slots: string[]): TemplatePart[] {
  if (!slots.length) {
    return html ? [{ type: "html", html }] : [];
  }
  const pattern = new RegExp(`\\{\\{\\s*(${slots.join("|")})\\s*\\}\\}`, "g");
  const parts: TemplatePart[] = [];
  let last = 0;
  for (const match of html.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ type: "html", html: html.slice(last, index) });
    }
    parts.push({ type: "slot", name: match[1] });
    last = index + match[0].length;
  }
  if (last < html.length) {
    parts.push({ type: "html", html: html.slice(last) });
  }
  return parts;
}
