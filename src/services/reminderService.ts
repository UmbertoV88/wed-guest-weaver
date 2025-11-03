import { supabase } from '@/integrations/supabase/client';
import type { PaymentReminder } from '@/types/budget';

export const reminderApi = {
  // Ottieni tutti i promemoria dell'utente
  async getAll(): Promise<PaymentReminder[]> {
    try {
      const { data, error } = await supabase
        .from('payment_reminders')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return (data || []) as PaymentReminder[];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  },

  // Ottieni promemoria non letti
  async getUnread(): Promise<PaymentReminder[]> {
    try {
      const { data, error } = await supabase
        .from('payment_reminders')
        .select('*')
        .eq('status', 'sent')
        .is('read_at', null)
        .lte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return (data || []) as PaymentReminder[];
    } catch (error) {
      console.error('Error fetching unread reminders:', error);
      return [];
    }
  },

  // Crea un promemoria personalizzato
  async create(data: any): Promise<PaymentReminder | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Cancella promemoria custom precedenti per questo vendor
      await this.cancelPreviousCustomReminders(data.vendor_id);

      const { data: result, error } = await supabase
        .from('payment_reminders')
        .insert({
          user_id: user.id,
          vendor_id: data.vendor_id,
          reminder_type: 'custom',
          scheduled_date: data.scheduled_date,
          custom_message: data.custom_message,
          notify_email: data.notify_email ?? true,
          notify_in_app: data.notify_in_app ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return result as PaymentReminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return null;
    }
  },

  // Segna come letto
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking reminder as read:', error);
      return false;
    }
  },

  // Cancella un promemoria
  async cancel(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      return false;
    }
  },

  // Cancella tutti i promemoria automatici per un vendor (quando si personalizza)
  async cancelAutoReminders(vendorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .update({ status: 'cancelled' })
        .eq('vendor_id', vendorId)
        .in('reminder_type', ['auto_7_days', 'auto_due_date'])
        .eq('status', 'pending');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling auto reminders:', error);
      return false;
    }
  },

  // Cancella tutti i promemoria custom precedenti per un vendor
  async cancelPreviousCustomReminders(vendorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_reminders')
        .delete()
        .eq('vendor_id', vendorId)
        .eq('reminder_type', 'custom')
        .in('status', ['pending', 'sent']);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting previous custom reminders:', error);
      return false;
    }
  }
};
