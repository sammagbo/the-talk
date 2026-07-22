const dateFormatter = new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "long", year: "numeric" });

export function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return dateFormatter.format(date);
}
