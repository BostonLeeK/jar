import { IconBolt, IconChart, IconCheck, IconLink, IconPlug, IconShare, IconToggle, IconWidget } from "@/components/icons";

export const LANDING_STEPS = [
  {
    title: "Підключи Банку",
    text: "Авторизуйся і обери Банку за пару кліків. Webhook ставиться сам.",
    icon: IconPlug,
  },
  {
    title: "Налаштуй віджети",
    text: "Готові overlay для OBS. Тема, тривалість чату і тестовий алерт одразу.",
    icon: IconToggle,
  },
  {
    title: "Запусти сторінку",
    text: "Отримай лінк /d/твій-нік і кидай його в чат одним кліком.",
    icon: IconShare,
  },
];

export const LANDING_FEATURES = [
  {
    title: "Готові віджети для OBS",
    text: "Алерт, прогрес, останні донати і чат Twitch. Тест без справжнього переказу.",
    icon: IconBolt,
  },
  {
    title: "Конструктор сторінки",
    text: "Noir, Paper, Neon, Pink і Sky. Або свій HTML, якщо хочеш повний контроль.",
    icon: IconWidget,
  },
  {
    title: "Свій лінк",
    text: "Короткий URL /d/твій-нік. QR і посилання на Банку після форми.",
    icon: IconLink,
  },
  {
    title: "Зрозуміла аналітика",
    text: "Перегляди, донати, сума, конверсія і графік по днях.",
    icon: IconChart,
  },
];

export const LANDING_TRUST = [
  { title: "Без складної настройки", icon: IconCheck },
  { title: "0% комісії сервісу", icon: IconCheck },
  { title: "Готово за пару хвилин", icon: IconCheck },
];
