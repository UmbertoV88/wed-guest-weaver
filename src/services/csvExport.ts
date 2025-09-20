import { Guest, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // Ordine categorie e status (se già applicato)
  const sortedGuests = [...guests] /* …ordinamento… */;

  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Fascia Età",
    "Allergie",
    "Data Creazione"
  ];

  const rows: string[][] = [];

  sortedGuests.forEach(guest => {
    // Salta i gruppi “Accompagnatori di …”
    if (guest.name.startsWith("Accompagnatori di ")) return;

    // Riga principale
    rows.push([
      guest.name,
      CATEGORY_LABELS[guest.category],
      STATUS_LABELS[guest.status],
      guest.ageGroup || "",
      guest.allergies || "",
      guest.createdAt.toLocaleDateString("it-IT")
    ]);

    // Righe per i suoi reali accompagnatori (se presenti), che non iniziano con “Accompagnatori di ”
    guest.companions.forEach(comp => {
      if (comp.name.startsWith("Accompagnatori di ")) return;
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


