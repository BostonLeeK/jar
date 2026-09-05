export type ChatPart = { type: "text"; text: string } | { type: "emote"; id: string; name: string };

export type ChatMessage = {
  id: string;
  nick: string;
  color: string;
  action: boolean;
  parts: ChatPart[];
};

function unescapeTag(value: string) {
  return value.replace(/\\s/g, " ").replace(/\\:/g, ";").replace(/\\\\/g, "\\").replace(/\\r/g, "\r").replace(/\\n/g, "\n");
}

function parseTags(raw: string) {
  const tags: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) {
      continue;
    }
    tags[part.slice(0, eq)] = unescapeTag(part.slice(eq + 1));
  }
  return tags;
}

function emoteParts(text: string, emotes: string): ChatPart[] {
  if (!emotes) {
    return text ? [{ type: "text", text }] : [];
  }
  const ranges: { start: number; end: number; id: string }[] = [];
  for (const group of emotes.split("/")) {
    const sep = group.indexOf(":");
    if (sep === -1) {
      continue;
    }
    const id = group.slice(0, sep);
    for (const span of group.slice(sep + 1).split(",")) {
      const [from, to] = span.split("-").map(Number);
      if (Number.isInteger(from) && Number.isInteger(to) && to >= from) {
        ranges.push({ start: from, end: to, id });
      }
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const parts: ChatPart[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ type: "text", text: text.slice(cursor, range.start) });
    }
    if (range.start >= cursor) {
      parts.push({ type: "emote", id: range.id, name: text.slice(range.start, range.end + 1) });
      cursor = range.end + 1;
    }
  }
  if (cursor < text.length) {
    parts.push({ type: "text", text: text.slice(cursor) });
  }
  return parts;
}

export function parseIrcLine(line: string):
  | { kind: "privmsg"; message: ChatMessage }
  | { kind: "clearchat"; nick: string }
  | { kind: "clearmsg"; id: string }
  | { kind: "ping"; token: string }
  | null {
  let rest = line.trim();
  if (!rest) {
    return null;
  }
  let tags: Record<string, string> = {};
  if (rest.startsWith("@")) {
    const space = rest.indexOf(" ");
    tags = parseTags(rest.slice(1, space));
    rest = rest.slice(space + 1);
  }
  if (rest.startsWith("PING")) {
    return { kind: "ping", token: rest.slice(5) || ":tmi.twitch.tv" };
  }
  const priv = rest.match(/^:([^! ]+)![^ ]+ PRIVMSG #[^ ]+ :(.*)$/);
  if (priv) {
    let text = priv[2];
    let action = false;
    if (text.startsWith("\u0001ACTION ") && text.endsWith("\u0001")) {
      action = true;
      text = text.slice(8, -1);
    }
    return {
      kind: "privmsg",
      message: {
        id: tags.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nick: tags["display-name"] || priv[1],
        color: tags.color || "",
        action,
        parts: emoteParts(text, tags.emotes || ""),
      },
    };
  }
  if (/\bCLEARCHAT\b/.test(rest)) {
    const nick = rest.split(" :")[1]?.trim().toLowerCase() ?? "";
    return { kind: "clearchat", nick };
  }
  if (/\bCLEARMSG\b/.test(rest) && tags["target-msg-id"]) {
    return { kind: "clearmsg", id: tags["target-msg-id"] };
  }
  return null;
}

export function twitchIrcNick() {
  return `justinfan${Math.floor(10000 + Math.random() * 90000)}`;
}
