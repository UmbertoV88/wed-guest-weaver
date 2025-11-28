import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Guest, GuestStatus } from "@/types/guest";
import { exportGuestsToExcel } from "@/services/excelExport";
import { useSubscription } from "@/hooks/useSubscription";
import { isInTrialPeriod } from "@/types/subscription";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";


interface ExportButtonProps {
  getAllGuests: () => Guest[];
  getGuestsByStatus: (status: GuestStatus) => Guest[];
}

const ExportButton = ({ getAllGuests, getGuestsByStatus }: ExportButtonProps) => {
  const { subscription } = useSubscription();
  const isInTrial = isInTrialPeriod(subscription);

  const handleExport = async () => {
    try {
      const allGuests = getAllGuests();
      await exportGuestsToExcel(allGuests, "lista_invitati_completa");
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <SimpleTooltip
      content={isInTrial ? "Funzione disponibile solo per utenti Premium" : "Esporta lista ospiti in Excel"}
    >
      <span>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-2 text-primary hover:bg-primary hover:text-primary-foreground transition-romantic"
          disabled={isInTrial}
        >
          <Download className="w-4 h-4" />
          Esporta Excel
        </Button>
      </span>
    </SimpleTooltip>
  );
};

export default ExportButton;