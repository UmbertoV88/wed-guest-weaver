import { Guest, CATEGORY_LABELS, STATUS_LABELS } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // Create CSV headers
  const headers = [
    "Nome",
    "Categoria", 
    "Status",
    "Fascia Età",
    "Allergie",
    "Accompagnatori",
    "Data Creazione"
  ];

  // Create CSV rows
  const rows = guests.map(guest => {
    const companionNames = guest.companions.map(c => `${c.name} (${STATUS_LABELS[c.status]})`).join("; ");
    
    return [
      guest.name,
      CATEGORY_LABELS[guest.category],
      STATUS_LABELS[guest.status],
      guest.ageGroup || "",
      guest.allergies || "",
      companionNames || "Nessuno",
      guest.createdAt.toLocaleDateString("it-IT")
    ];
  });

  // Convert to CSV format
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(field => `"${field}"`).join(","))
  ].join("\n");

  // Create and download file
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