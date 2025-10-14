import { Guest, CATEGORY_LABELS, STATUS_LABELS, GuestCategory, GuestStatus, AgeGroup } from "@/types/guest";

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
  
  // Espandi gli ospiti con gli accompagnatori come righe separate
  interface ExpandedGuest {
    name: string;
    category: GuestCategory;
    status: GuestStatus;
    ageGroup?: AgeGroup;
    allergies?: string;
    companionOf: string; // Nome dell'ospite principale (vuoto se è un ospite principale)
  }
  
  const expandedGuests: ExpandedGuest[] = [];
  
  activeGuests.forEach(guest => {
    // Aggiungi l'ospite principale
    expandedGuests.push({
      name: guest.name,
      category: guest.category,
      status: guest.status,
      ageGroup: guest.ageGroup,
      allergies: guest.allergies,
      companionOf: "" // Vuoto perché è l'ospite principale
    });
    
    // Aggiungi tutti gli accompagnatori (esclusi quelli eliminati)
    guest.companions
      .filter(c => c.status !== "deleted")
      .forEach(companion => {
        expandedGuests.push({
          name: companion.name,
          category: guest.category, // Eredita categoria
          status: companion.status,
          ageGroup: companion.ageGroup,
          allergies: companion.allergies,
          companionOf: guest.name // Nome dell'ospite principale
        });
      });
  });
  
  // Raggruppa per categoria e ordina per status e nome
  const guestsByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = expandedGuests
      .filter(item => item.category === category)
      .sort((a, b) => {
        // Prima ordina per status (confirmed prima di pending)
        if (a.status !== b.status) {
          return a.status === "confirmed" ? -1 : 1;
        }
        // Poi ordina alfabeticamente per nome
        return a.name.localeCompare(b.name, 'it-IT', { sensitivity: 'base' });
      });
    return acc;
  }, {} as Record<GuestCategory, ExpandedGuest[]>);
  
  // Create CSV headers
  const headers = [
    "Nome",
    "Categoria", 
    "Status",
    "Fascia Età",
    "Allergie",
    "Accompagnatore di"
  ];
  
  // Costruisci il contenuto CSV
  const csvLines: string[] = [headers.join(",")];
  
  categoryOrder.forEach((category, index) => {
    const categoryItems = guestsByCategory[category];
    
    // Salta le categorie vuote
    if (categoryItems.length === 0) return;
    
    // Aggiungi le righe (ospiti + accompagnatori)
    categoryItems.forEach(item => {
      const row = [
        item.name,
        CATEGORY_LABELS[item.category],
        STATUS_LABELS[item.status],
        item.ageGroup || "",
        item.allergies || "",
        item.companionOf || ""
      ];
      
      csvLines.push(row.map(field => `"${field}"`).join(","));
    });
    
    // Aggiungi riga vuota dopo ogni categoria (tranne l'ultima)
    if (index < categoryOrder.length - 1 && categoryItems.length > 0) {
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