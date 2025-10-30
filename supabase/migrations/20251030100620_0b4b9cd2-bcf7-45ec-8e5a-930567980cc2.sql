-- Tabella per gestire i promemoria dei pagamenti
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES budget_vendors(id) ON DELETE CASCADE,
  
  -- Tipo di promemoria
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('auto_7_days', 'auto_due_date', 'custom')),
  
  -- Data programmata per l'invio
  scheduled_date DATE NOT NULL,
  
  -- Stato del promemoria
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  
  -- Metodi di notifica
  notify_email BOOLEAN DEFAULT true,
  notify_in_app BOOLEAN DEFAULT true,
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Metadata
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: un utente non può avere più promemoria dello stesso tipo per lo stesso vendor
  CONSTRAINT unique_reminder_per_vendor UNIQUE (user_id, vendor_id, reminder_type)
);

-- Indici per performance
CREATE INDEX idx_payment_reminders_user_id ON payment_reminders(user_id);
CREATE INDEX idx_payment_reminders_vendor_id ON payment_reminders(vendor_id);
CREATE INDEX idx_payment_reminders_scheduled_date ON payment_reminders(scheduled_date);
CREATE INDEX idx_payment_reminders_status ON payment_reminders(status);
CREATE INDEX idx_payment_reminders_pending ON payment_reminders(scheduled_date, status) WHERE status = 'pending';

-- RLS Policies
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON payment_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON payment_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON payment_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON payment_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per updated_at
CREATE TRIGGER update_payment_reminders_updated_at
  BEFORE UPDATE ON payment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function per creare automaticamente i promemoria quando viene aggiunta/modificata la data di scadenza di un vendor
CREATE OR REPLACE FUNCTION create_auto_payment_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Se c'è una payment_due_date e il pagamento non è completo
  IF NEW.payment_due_date IS NOT NULL AND NEW.complete_payment_date IS NULL THEN
    
    -- Promemoria a 7 giorni (solo se la data è nel futuro)
    IF NEW.payment_due_date - INTERVAL '7 days' >= CURRENT_DATE THEN
      INSERT INTO payment_reminders (user_id, vendor_id, reminder_type, scheduled_date)
      VALUES (NEW.user_id, NEW.id, 'auto_7_days', NEW.payment_due_date - INTERVAL '7 days')
      ON CONFLICT (user_id, vendor_id, reminder_type) 
      DO UPDATE SET scheduled_date = EXCLUDED.scheduled_date, status = 'pending', updated_at = NOW();
    END IF;
    
    -- Promemoria il giorno stesso (solo se la data è nel futuro o oggi)
    IF NEW.payment_due_date >= CURRENT_DATE THEN
      INSERT INTO payment_reminders (user_id, vendor_id, reminder_type, scheduled_date)
      VALUES (NEW.user_id, NEW.id, 'auto_due_date', NEW.payment_due_date)
      ON CONFLICT (user_id, vendor_id, reminder_type) 
      DO UPDATE SET scheduled_date = EXCLUDED.scheduled_date, status = 'pending', updated_at = NOW();
    END IF;
    
  -- Se il pagamento è completato, cancella i promemoria automatici pendenti
  ELSIF NEW.complete_payment_date IS NOT NULL THEN
    UPDATE payment_reminders 
    SET status = 'cancelled', updated_at = NOW()
    WHERE vendor_id = NEW.id 
      AND status = 'pending'
      AND reminder_type IN ('auto_7_days', 'auto_due_date');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger su budget_vendors
CREATE TRIGGER trigger_auto_payment_reminders
  AFTER INSERT OR UPDATE OF payment_due_date, complete_payment_date ON budget_vendors
  FOR EACH ROW
  EXECUTE FUNCTION create_auto_payment_reminders();