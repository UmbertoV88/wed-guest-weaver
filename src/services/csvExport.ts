import { Guest, GuestCategory, GuestStatus, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // Ordine categorie e status
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

  // Ordina per categoria e poi per status
  const sortedGuests = [...guests].sort((a, b) => {
    const ca = categoryOrder[a.category] ?? 2;
    const cb = categoryOrder[b.category] ?? 2;
    if (ca !== cb) return ca - cb;
    return (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
  });

  // Header
  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Fascia Età",
    "Allergie",
    "Data Creazione"
  ];

  // Costruisci righe principali e accompagnatori
  const rows: string[][] = [];
  sortedGuests.forEach(guest => {
    // Riga principale
    rows.push([
      guest.name,
      CATEGORY_LABELS[guest.category],
      STATUS_LABELS[guest.status],                 // Usa STATUS_LABELS qui
      guest.ageGroup || "",
      guest.allergies || "",
      guest.createdAt.toLocaleDateString("it-IT")
    ]);
    // Companions
    guest.companions.forEach(comp => {
      rows.push([
        comp.name,
        CATEGORY_LABELS[guest.category],
        STATUS_LABELS[comp.status],                // E qui per ciascun companion
        comp.ageGroup || "",
        comp.allergies || "",
        guest.createdAt.toLocaleDateString("it-IT")
      ]);
    });
  });

  // Genera e scarica
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

