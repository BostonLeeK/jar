export const PAGE_TAGS = [
  "{{title}}",
  "{{bio}}",
  "{{avatar}}",
  "{{cover}}",
  "{{twitch}}",
  "{{raised}}",
  "{{goal}}",
  "{{percent}}",
  "{{donate}}",
  "{{#each recent}} {{nickname}} {{amount}} {{/each}}",
];

export const ALERT_TAGS = ["{{nickname}}", "{{amount}}", "{{message}}", "{{kind}}", "{{detail}}", "{{gif}}"];
export const GOAL_TAGS = ["{{title}}", "{{raised}}", "{{goal}}", "{{percent}}"];
export const RECENT_TAGS = ["{{title}}", "{{#each items}} {{nickname}} {{amount}} {{/each}}"];

export const DEFAULT_PAGE_HTML = `<div class="jar-page">
  <header class="jar-head">
    {{avatar}}
    <div>
      <h1>{{title}}</h1>
      <div class="jar-twitch">{{twitch}}</div>
    </div>
  </header>
  <p class="jar-bio">{{bio}}</p>
  <div class="jar-goal">
    <div class="jar-goal-row"><span>{{raised}}</span><span>{{goal}}</span></div>
    <div class="jar-bar"><i style="width:{{percent}}%"></i></div>
  </div>
  <div class="jar-recent">
    {{#each recent}}
      <div class="jar-row"><span>{{nickname}}</span><span>{{amount}}</span></div>
    {{/each}}
  </div>
  <section class="jar-box">{{donate}}</section>
</div>`;

export const DEFAULT_PAGE_CSS = `.jar-page{min-height:100dvh;box-sizing:border-box;padding:48px 24px;max-width:720px;margin:0 auto;color:#fff;font-family:Inter,system-ui,sans-serif}
.jar-head{display:flex;gap:16px;align-items:center}
.jar-head img,.jar-avatar{width:64px;height:64px;border-radius:999px;object-fit:cover}
.jar-head h1{margin:0;font-size:36px}
.jar-twitch{opacity:.6;font-size:14px;margin-top:4px}
.jar-bio{opacity:.7;line-height:1.6}
.jar-goal{margin:28px 0}
.jar-goal-row{display:flex;justify-content:space-between;font-size:14px;opacity:.7;margin-bottom:8px}
.jar-bar{height:8px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden}
.jar-bar i{display:block;height:100%;background:#fff}
.jar-row{display:flex;justify-content:space-between;font-size:14px;opacity:.75;margin:6px 0}
.jar-box{margin-top:32px;padding:24px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:rgba(255,255,255,.04)}`;

export const DEFAULT_ALERT_HTML = `<div class="jar-alert">
  {{gif}}
  <div class="jar-line"><b>{{nickname}}</b> — {{detail}}</div>
  <div class="jar-msg">{{message}}</div>
</div>`;

export const DEFAULT_ALERT_CSS = `.jar-alert{color:#fff;font-family:Inter,system-ui,sans-serif;text-align:center;max-width:720px}
.jar-alert img,.jar-gif{max-height:200px;max-width:100%;object-fit:contain;margin-bottom:12px}
.jar-line{font-size:22px}
.jar-msg{margin-top:6px;opacity:.7;font-size:14px}`;

export const DEFAULT_GOAL_HTML = `<div class="jar-goalw">
  <div class="jar-goal-row"><span>{{title}}</span><span>{{raised}} / {{goal}}</span></div>
  <div class="jar-bar"><i style="width:{{percent}}%"></i></div>
</div>`;

export const DEFAULT_GOAL_CSS = `.jar-goalw{width:440px;max-width:100%;color:#fff;font-family:Inter,system-ui,sans-serif}
.jar-goal-row{display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px}
.jar-bar{height:8px;background:rgba(255,255,255,.16);border-radius:999px;overflow:hidden}
.jar-bar i{display:block;height:100%;background:#fff}`;

export const DEFAULT_RECENT_HTML = `<div class="jar-recentw">
  <div class="jar-rtitle">{{title}}</div>
  {{#each items}}
    <div class="jar-row"><span>{{nickname}}</span><span>{{amount}}</span></div>
  {{/each}}
</div>`;

export const DEFAULT_RECENT_CSS = `.jar-recentw{width:320px;max-width:100%;color:#fff;font-family:Inter,system-ui,sans-serif}
.jar-rtitle{font-size:11px;letter-spacing:.16em;text-transform:uppercase;opacity:.45;margin-bottom:8px}
.jar-row{display:flex;justify-content:space-between;gap:12px;font-size:14px;margin:6px 0}`;
