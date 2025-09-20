import { Guest, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // 1) Mappa per l’ordine di categoria
  const categoryOrder: Record<GuestCategory, number> = {
    'family-hers': 0,
    'family-his' : 1,
    'friends'    : 2,
    'colleagues' : 2,
  };

  // 2) Ordina per categoria, poi per confermato (false prima di true)
  const sortedGuests = [...guests].sort((a, b) => {
    const ca = categoryOrder[a.category] ?? 2;
    const cb = categoryOrder[b.category] ?? 2;
    if (ca !== cb) return ca - cb;
    // confermato: false (0) prima di true (1)
    return (a.confermato ? 1 : 0) - (b.confermato ? 1 : 0);
  });

  // 3) Intestazioni
  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Fascia Età",
    "Allergie",
    "Data Creazione"
  ];

  // 4) Costruisci righe solo per invitati principali e poi i companions
  const rows: string[][] = [];
  sortedGuests.forEach(guest => {
    // Riga ospite principale
    rows.push([
      guest.name,
      CATEGORY_LABELS[guest.category],
      guest.confermato ? "Confermato" : "Da confermare",
      guest.fascia_eta || "",
      guest.allergies || "",
      guest.createdAt.toLocaleDateString("it-IT")
    ]);
    // Righe accompagnatori (se presenti)
    guest.companions.forEach(comp => {
      rows.push([
        comp.name,
        CATEGORY_LABELS[guest.category],
        comp.confermato ? "Confermato" : "Da confermare",
        comp.fascia_eta || "",
        comp.allergies || "",
        guest.createdAt.toLocaleDateString("it-IT")
      ]);
    });
  });

  // 5) Genera e scarica il CSV
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
