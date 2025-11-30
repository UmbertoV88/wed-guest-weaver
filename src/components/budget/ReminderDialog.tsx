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
import { it, enUS } from "date-fns/locale";
import { reminderApi } from "@/services/reminderService";
import { useTranslation } from "react-i18next";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vendor: any; // TODO: Create proper Vendor type
  onReminderCreated: () => void;
}

export const ReminderDialog: React.FC<ReminderDialogProps> = ({
  open,
  onOpenChange,
  vendor,
  onReminderCreated
}) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'it' ? it : enUS;
  const [date, setDate] = useState<Date>();
  const [customMessage, setCustomMessage] = useState("");
  const [cancelAutoReminders, setCancelAutoReminders] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date) {
      console.error("Toast removed:", {
        title: t('common.status.error'),
        description: t('budget.reminders.errors.dateRequired'),
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

      // Crea il promemoria personalizzato (solo in-app)
      const result = await reminderApi.create({
        vendor_id: vendor.id,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        custom_message: customMessage,
        notify_email: false,
        notify_in_app: true
      });

      if (result) {
        console.error("Toast removed:", {
          title: t('budget.reminders.success'),
          description: t('budget.reminders.successDescription', { date: format(date, 'dd MMMM yyyy', { locale: dateLocale }) })
        });
        onReminderCreated();
        onOpenChange(false);

        // Reset form
        setDate(undefined);
        setCustomMessage("");
        setCancelAutoReminders(false);
      } else {
        throw new Error(t('budget.reminders.errors.createFailed'));
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      console.error("Toast removed:", {
        title: t('common.status.error'),
        description: t('budget.reminders.errors.createFailed'),
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
          <DialogTitle>{t('budget.reminders.dialogTitle', { name: vendor?.name })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('budget.reminders.dateLabel')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd MMMM yyyy', { locale: dateLocale }) : t('budget.reminders.selectDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={dateLocale}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('budget.reminders.messageLabel')}</Label>
            <Textarea
              placeholder={t('budget.reminders.messagePlaceholder')}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
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
                  {t('budget.reminders.disableAuto')}
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('budget.reminders.creating') : t('budget.reminders.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
