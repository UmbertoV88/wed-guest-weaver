-- Aggiungere colonna bomboniera_assegnata alla tabella invitati
ALTER TABLE invitati 
ADD COLUMN bomboniera_assegnata BOOLEAN NOT NULL DEFAULT false;

-- Indice per ottimizzare le query
CREATE INDEX idx_invitati_bomboniera 
ON invitati(user_id, bomboniera_assegnata, confermato);

-- Commento descrittivo
COMMENT ON COLUMN invitati.bomboniera_assegnata IS 
'Indica se alla persona è stata assegnata una bomboniera';