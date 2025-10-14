import ExcelJS from 'exceljs';
import { Guest, CATEGORY_LABELS, STATUS_LABELS, GuestCategory, GuestStatus, AgeGroup, AGE_GROUP_LABELS } from "@/types/guest";

interface ExpandedGuest {
  name: string;
  category: GuestCategory;
  status: GuestStatus;
  ageGroup?: AgeGroup;
  allergies?: string;
  companionOf: string;
}

export const exportGuestsToExcel = async (guests: Guest[], filename: string = "lista_invitati") => {
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
  const expandedGuests: ExpandedGuest[] = [];
  
  activeGuests.forEach(guest => {
    // Aggiungi l'ospite principale
    expandedGuests.push({
      name: guest.name,
      category: guest.category,
      status: guest.status,
      ageGroup: guest.ageGroup,
      allergies: guest.allergies,
      companionOf: ""
    });
    
    // Aggiungi tutti gli accompagnatori (esclusi quelli eliminati)
    guest.companions
      .filter(c => c.status !== "deleted")
      .forEach(companion => {
        expandedGuests.push({
          name: companion.name,
          category: guest.category,
          status: companion.status,
          ageGroup: companion.ageGroup,
          allergies: companion.allergies,
          companionOf: guest.name
        });
      });
  });
  
  // Raggruppa per categoria e ordina per status e nome
  const guestsByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = expandedGuests
      .filter(item => item.category === category)
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "confirmed" ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'it-IT', { sensitivity: 'base' });
      });
    return acc;
  }, {} as Record<GuestCategory, ExpandedGuest[]>);
  
  // Crea il workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lista Invitati');
  
  // Configura le colonne
  worksheet.columns = [
    { header: 'Nome', key: 'name', width: 25 },
    { header: 'Categoria', key: 'category', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Fascia Età', key: 'ageGroup', width: 15 },
    { header: 'Allergie', key: 'allergies', width: 25 },
    { header: 'Accompagnatore di', key: 'companionOf', width: 25 }
  ];
  
  // Formatta l'intestazione
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A90E2' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;
  
  // Aggiungi bordi all'intestazione
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });
  
  // Aggiungi i dati per ogni categoria
  categoryOrder.forEach((category, categoryIndex) => {
    const categoryItems = guestsByCategory[category];
    
    if (categoryItems.length === 0) return;
    
    // Aggiungi le righe degli invitati
    categoryItems.forEach(item => {
      const row = worksheet.addRow({
        name: item.name,
        category: CATEGORY_LABELS[item.category],
        status: STATUS_LABELS[item.status],
        ageGroup: item.ageGroup ? AGE_GROUP_LABELS[item.ageGroup] : "",
        allergies: item.allergies || "",
        companionOf: item.companionOf || ""
      });
      
      // Applica il BOLD se status è "Confermato"
      if (item.status === "confirmed") {
        row.getCell('status').font = { bold: true };
      }
    });
    
    // Aggiungi riga di totale dopo la categoria
    const totalRow = worksheet.addRow({
      name: '',
      category: '',
      status: `TOTALE INVITATI: ${categoryItems.length}`,
      ageGroup: '',
      allergies: '',
      companionOf: ''
    });
    
    // Formatta la riga di totale
    totalRow.font = { bold: true, size: 11 };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4F8' }
    };
    totalRow.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Aggiungi riga vuota dopo ogni categoria (tranne l'ultima)
    if (categoryIndex < categoryOrder.length - 1) {
      worksheet.addRow({});
    }
  });
  
  // Freeze della prima riga (intestazioni)
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];
  
  // Genera il file Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Scarica il file
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 1000);
};
