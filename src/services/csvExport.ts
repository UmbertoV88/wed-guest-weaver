import { Guest, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // 1) Definisci l’ordine desiderato per le categorie
  const orderMap: Record<GuestCategory, number> = {
    'family-hers': 0,
    'family-his': 1,
    'friends': 2,
    'colleagues': 2,   // o qualsiasi categoria tu voglia considerare "altri"
  };

  // 2) Ordina la lista di invitati
  const sortedGuests = [...guests].sort((a, b) => {
    const oa = orderMap[a.category] ?? 2;
    const ob = orderMap[b.category] ?? 2;
    return oa - ob;
  });

  // 3) Crea header e righe dal sortedGuests
  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Fascia Età",
    "Allergie",
    "Accompagnatori",
    "Data Creazione"
  ];

  const rows = sortedGuests.map(guest => {
    const companionNames = guest.companions
      .map(c => `${c.name} (${STATUS_LABELS[c.status]})`)
      .join("; ") || "Nessuno";

    return [
      guest.name,
      CATEGORY_LABELS[guest.category],
      STATUS_LABELS[guest.status],
      guest.ageGroup || "",
      guest.allergies || "",
      companionNames,
      guest.createdAt.toLocaleDateString("it-IT")
    ];
  });

  // 4) Componi CSV e scaricalo (unchanged)
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(field => `"${field}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
