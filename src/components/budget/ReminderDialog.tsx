import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { reminderApi } from "@/services/reminderService";
import { useToast } from "@/hooks/use-toast";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: any;
  onReminderCreated: () => void;
}

export const ReminderDialog: React.FC<ReminderDialogProps> = ({
  open,
  onOpenChange,
  vendor,
  onReminderCreated
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [customMessage, setCustomMessage] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [cancelAutoReminders, setCancelAutoReminders] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: "Errore",
        description: "Seleziona una data per il promemoria",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Cancella i promemoria automatici se richiesto
      if (cancelAutoReminders) {
        await reminderApi.cancelAutoReminders(vendor.id);
      }

      // Crea il promemoria personalizzato
      const result = await reminderApi.create({
        vendor_id: vendor.id,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        custom_message: customMessage,
        notify_email: notifyEmail,
        notify_in_app: notifyInApp
      });

      if (result) {
        toast({
          title: "✅ Promemoria creato",
          description: `Ti ricorderemo il ${format(date, 'dd MMMM yyyy', { locale: it })}`
        });
        onReminderCreated();
        onOpenChange(false);
        
        // Reset form
        setDate(undefined);
        setCustomMessage("");
        setNotifyEmail(true);
        setNotifyInApp(true);
        setCancelAutoReminders(false);
      } else {
        throw new Error('Errore nella creazione del promemoria');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il promemoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Imposta Promemoria per {vendor?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Data Promemoria</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd MMMM yyyy', { locale: it }) : "Seleziona data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Messaggio Personalizzato (opzionale)</Label>
            <Textarea
              placeholder="Es: Ricordati di portare i documenti..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Metodo di Notifica</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={notifyEmail}
                onCheckedChange={(checked) => setNotifyEmail(checked as boolean)}
              />
              <label htmlFor="email" className="text-sm">Invia Email</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inapp"
                checked={notifyInApp}
                onCheckedChange={(checked) => setNotifyInApp(checked as boolean)}
              />
              <label htmlFor="inapp" className="text-sm">Notifica In-App</label>
            </div>
          </div>

          {vendor?.payment_due_date && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancel-auto"
                  checked={cancelAutoReminders}
                  onCheckedChange={(checked) => setCancelAutoReminders(checked as boolean)}
                />
                <label htmlFor="cancel-auto" className="text-sm text-yellow-800">
                  Disattiva i promemoria automatici (7 giorni prima e giorno stesso)
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creazione..." : "Crea Promemoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
