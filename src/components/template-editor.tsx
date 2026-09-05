"use client";

import { Label, Textarea } from "@/components/ui";

export function TemplateEditor({
  html,
  css,
  tags,
  onHtml,
  onCss,
}: {
  html: string;
  css: string;
  tags: string[];
  onHtml: (value: string) => void;
  onCss: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-zinc-500">{tags.join(" · ")}</p>
      <div>
        <Label>HTML</Label>
        <Textarea
          value={html}
          onChange={(event) => onHtml(event.target.value)}
          spellCheck={false}
          className="min-h-48 font-mono text-xs"
        />
      </div>
      <div>
        <Label>CSS</Label>
        <Textarea
          value={css}
          onChange={(event) => onCss(event.target.value)}
          spellCheck={false}
          className="min-h-36 font-mono text-xs"
        />
      </div>
    </div>
  );
}
