import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Guest, GuestStatus } from "@/types/guest";
import { exportGuestsToExcel } from "@/services/excelExport";


interface ExportButtonProps {
  getAllGuests: () => Guest[];
  getGuestsByStatus: (status: GuestStatus) => Guest[];
}

const ExportButton = ({ getAllGuests, getGuestsByStatus }: ExportButtonProps) => {

  const handleExport = async () => {
    try {
      const allGuests = getAllGuests();
      await exportGuestsToExcel(allGuests, "lista_invitati_completa");
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="flex items-center gap-2 text-primary hover:bg-primary hover:text-primary-foreground transition-romantic"
    >
      <Download className="w-4 h-4" />
      Esporta Excel
    </Button>
  );
};

export default ExportButton;