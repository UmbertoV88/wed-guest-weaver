import { Guest, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // 1) Definisci ordine di category e status
  const categoryOrder: Record<GuestCategory, number> = {
    'family-hers': 0,
    'family-his' : 1,
    'friends'    : 2,
    'colleagues' : 2,
  };
  const statusOrder: Record<GuestStatus, number> = {
    'pending'  : 0,
    'confirmed': 1,
    'deleted'  : 2,
  };

  // 2) Ordina prima per categoria, poi per status
  const sortedGuests = [...guests].sort((a, b) => {
    const ca = categoryOrder[a.category] ?? 2;
    const cb = categoryOrder[b.category] ?? 2;
    if (ca !== cb) return ca - cb;
    const sa = statusOrder[a.status] ?? 2;
    const sb = statusOrder[b.status] ?? 2;
    return sa - sb;
  });

  // 3) Header e righe senza colonna “Accompagnatori”
  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Fascia Età",
    "Allergie",
    "Data Creazione"
  ];
  const rows: string[][] = [];

  // 4) Genera righe per ospiti principali e companions
  sortedGuests.forEach(guest => {
    rows.push([
      guest.name,
      CATEGORY_LABELS[guest.category],
      STATUS_LABELS[guest.status],
      guest.ageGroup || "",
      guest.allergies || "",
      guest.createdAt.toLocaleDateString("it-IT")
    ]);
    guest.companions.forEach(comp => {
      rows.push([
        comp.name,
        CATEGORY_LABELS[guest.category],
        STATUS_LABELS[comp.status],
        comp.ageGroup || "",
        comp.allergies || "",
        guest.createdAt.toLocaleDateString("it-IT")
      ]);
    });
  });

  // 5) Crea e scarica CSV
  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.map(f => `"${f}"`).join(","))
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


