export const logger = {
  error(fields: Record<string, unknown>) {
    console.error(JSON.stringify({ level: "error", ...fields }));
  },
};
