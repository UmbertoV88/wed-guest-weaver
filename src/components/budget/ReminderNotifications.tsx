import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X } from "lucide-react";
import { reminderApi } from "@/services/reminderService";
import type { PaymentReminder } from "@/types/budget";

export const ReminderNotifications: React.FC = () => {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);

  const loadReminders = async () => {
    const unread = await reminderApi.getUnread();
    setReminders(unread);
  };

  useEffect(() => {
    loadReminders();
    
    // Poll ogni 5 minuti
    const interval = setInterval(loadReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await reminderApi.markAsRead(id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="border-2 border-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-orange-500 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-orange-100 text-orange-800">
                    Promemoria Pagamento
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {reminder.custom_message || "Hai un pagamento in scadenza"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Scadenza: {new Date(reminder.scheduled_date).toLocaleDateString('it-IT')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(reminder.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
