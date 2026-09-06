export class MonobankApiError extends Error {
  status: number;
  description?: string;

  constructor(status: number, description?: string) {
    super(description || `Monobank відповіла ${status}`);
    this.name = "MonobankApiError";
    this.status = status;
    this.description = description;
  }
}

export function monobankUserMessage(error: unknown) {
  if (error instanceof MonobankApiError) {
    if (error.status === 400) {
      return "Некоректний запит до Monobank";
    }
    if (error.status === 401) {
      return "Користувач ще не підтвердив доступ";
    }
    if (error.status === 403) {
      return "Невалідний підпис або доступ сервісу Monobank";
    }
    if (error.status === 404) {
      return "Запит не знайдено або термін дії минув";
    }
    if (error.status === 429) {
      return "Забагато запитів до Monobank. Спробуй пізніше";
    }
    if (error.status >= 500) {
      return "Monobank тимчасово недоступний";
    }
  }
  return "Не вдалося виконати запит до Monobank";
}

export function monobankHttpStatus(error: unknown) {
  if (!(error instanceof MonobankApiError)) {
    return 502;
  }
  if (error.status === 400 || error.status === 404 || error.status === 429) {
    return error.status;
  }
  if (error.status === 401) {
    return 409;
  }
  return 502;
}
