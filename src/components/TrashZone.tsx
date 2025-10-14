import React, { useState } from "react";
import { useDrop } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface TrashZoneProps {
  onMoveGuest: (guestId: number, tableId?: number) => void;
}

const TrashZone: React.FC<TrashZoneProps> = ({ onMoveGuest }) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [guestToRemove, setGuestToRemove] = useState<number | null>(null);
  
  const [{ isOver }, drop] = useDrop({
    accept: 'guest',
    drop: (item: { guestId: number }) => {
      setGuestToRemove(item.guestId);
      setShowRemoveDialog(true);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleConfirmRemove = () => {
    if (guestToRemove !== null) {
      onMoveGuest(guestToRemove);
      setGuestToRemove(null);
    }
  };

  return (
    <>
      <Card
        ref={drop}
        className={`
          border-2 border-dashed transition-all duration-200
          ${isOver 
            ? 'border-destructive bg-destructive/10 scale-105' 
            : 'border-destructive/50 hover:border-destructive'
          }
        `}
      >
        <CardContent className="py-8">
          <div className="text-center">
            <Trash2 
              className={`
                h-8 w-8 mx-auto mb-2 transition-all duration-200
                ${isOver ? 'text-destructive scale-110' : 'text-destructive/70'}
              `} 
            />
            <h3 className="font-semibold text-destructive mb-1">
              Zona Rimozione
            </h3>
            <p className="text-sm text-muted-foreground">
              Trascina qui gli ospiti per rimuoverli dai tavoli
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Gli ospiti rimossi torneranno nella lista "Non Assegnati"
            </p>
          </div>
        </CardContent>
      </Card>
      
      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Rimuovi Ospite"
        description="Sei sicuro di voler rimuovere questo ospite dall'assegnazione del tavolo? L'ospite tornerà nella lista non assegnati."
        confirmText="Rimuovi"
        cancelText="Annulla"
        onConfirm={handleConfirmRemove}
        variant="destructive"
      />
    </>
  );
};

export default TrashZone;