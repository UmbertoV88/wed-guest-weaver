import { Guest, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // 1) Mappa per ordinare prima famiglia di lei, poi famiglia di lui, poi altri
  const orderMap: Record<GuestCategory, number> = {
    'family-hers': 0,
    'family-his': 1,
    'friends': 2,
    'colleagues': 2,
  };

  // 2) Ordina gli invitati principali per categoria
  const sortedGuests = [...guests].sort((a, b) => {
    const oa = orderMap[a.category] ?? 2;
    const ob = orderMap[b.category] ?? 2;
    return oa - ob;
  });

  // 3) Intestazioni senza “Accompagnatori”
  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Fascia Età",
    "Allergie",
    "Data Creazione"
  ];

  // 4) Costruisci le righe: per ogni guest principale e poi i suoi companions (se presenti)
  const rows: string[][] = [];

  sortedGuests.forEach(guest => {
    // Riga dell'ospite principale
    rows.push([
      guest.name,
      CATEGORY_LABELS[guest.category],
      STATUS_LABELS[guest.status],
      guest.ageGroup || "",
      guest.allergies || "",
      guest.createdAt.toLocaleDateString("it-IT")
    ]);

    // Righe degli accompagnatori (solo se ne esistono)
    guest.companions.forEach(comp => {
      rows.push([
        comp.name,                                 // Nome del companion
        CATEGORY_LABELS[guest.category],          // Stessa categoria del principale
        STATUS_LABELS[comp.status],               // Status del companion
        comp.ageGroup || "",
        comp.allergies || "",
        guest.createdAt.toLocaleDateString("it-IT")
      ]);
    });
  });

  // 5) Componi il contenuto CSV
  const csvContent = [
    headers.join(","),                         // Header
    ...rows.map(row => row.map(field => `"${field}"`).join(","))
  ].join("\n");

  // 6) Creazione e download del file
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

