import { Guest, CATEGORY_LABELS, STATUS_LABELS, GuestCategory } from "@/types/guest";

export const exportGuestsToCSV = (guests: Guest[], filename: string = "invitati_matrimonio") => {
  // Ordine delle categorie
  const categoryOrder: GuestCategory[] = [
    "family-his",
    "family-hers", 
    "friends",
    "colleagues"
  ];
  
  // Filtra gli ospiti eliminati
  const activeGuests = guests.filter(guest => guest.status !== "deleted");
  
  // Raggruppa gli ospiti per categoria
  const guestsByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = activeGuests.filter(guest => guest.category === category);
    return acc;
  }, {} as Record<GuestCategory, Guest[]>);
  
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
  
  // Costruisci il contenuto CSV
  const csvLines: string[] = [headers.join(",")];
  
  categoryOrder.forEach((category, index) => {
    const categoryGuests = guestsByCategory[category];
    
    // Salta le categorie vuote
    if (categoryGuests.length === 0) return;
    
    // Aggiungi intestazione della categoria
    const categoryHeader = `--- ${CATEGORY_LABELS[category].toUpperCase()} ---`;
    csvLines.push(`"${categoryHeader}"`);
    
    // Aggiungi le righe degli ospiti
    categoryGuests.forEach(guest => {
      const companionNames = guest.companions
        .filter(c => c.status !== "deleted")
        .map(c => `${c.name} (${STATUS_LABELS[c.status]})`)
        .join("; ");
      
      const row = [
        guest.name,
        CATEGORY_LABELS[guest.category],
        STATUS_LABELS[guest.status],
        guest.ageGroup || "",
        guest.allergies || "",
        companionNames || "Nessuno",
        guest.createdAt.toLocaleDateString("it-IT")
      ];
      
      csvLines.push(row.map(field => `"${field}"`).join(","));
    });
    
    // Aggiungi riga vuota dopo ogni categoria (tranne l'ultima)
    if (index < categoryOrder.length - 1) {
      csvLines.push("");
    }
  });
  
  // Converti a stringa CSV
  const csvContent = csvLines.join("\n");
  
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