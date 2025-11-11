import React, { useState } from "react";
import { useDrag } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Crown, Users, UserPlus, AlertTriangle } from "lucide-react";
import { SeatingGuest } from "@/hooks/useSeating";
import { CATEGORY_LABELS, AGE_GROUP_LABELS, CATEGORY_ICONS, AGE_GROUP_ICONS } from "@/types/guest";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface DraggableGuestProps {
  guest: SeatingGuest;
  onMoveGuest: (guestId: number, tableId?: number) => void;
  showRemoveButton?: boolean;
}

const DraggableGuest: React.FC<DraggableGuestProps> = ({
  guest,
  onMoveGuest,
  showRemoveButton = true,
}) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'guest',
    item: { guestId: guest.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveDialog(true);
  };

  const handleConfirmRemove = () => {
    onMoveGuest(guest.id);
  };

  return (
    <>
      <Card
        ref={drag}
        className={`
          cursor-move transition-all duration-200 hover:shadow-md
          ${isDragging ? 'opacity-50 transform rotate-2' : ''}
        ${guest.gruppo === 'family-his' ? 
          'ring-1 ring-blue-500/30 bg-blue-50 dark:bg-blue-950/20' : 
          guest.gruppo === 'family-hers' ? 
          'ring-1 ring-purple-500/30 bg-purple-50 dark:bg-purple-950/20' :
          guest.gruppo === 'friends' ?
          'ring-1 ring-green-500/30 bg-green-50 dark:bg-green-950/20' :
          guest.gruppo === 'colleagues' ?
          'ring-1 ring-emerald-600/40 bg-emerald-100 dark:bg-emerald-900/30' :
          'ring-1 ring-gray-500/30 bg-gray-50 dark:bg-gray-950/20'}
        `}
      >

        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {guest.nome_visualizzato}
                </p>
                {guest.is_principale ? (
                  <Crown className="h-3 w-3 text-blue-600 flex-shrink-0" />
                ) : (
                  <UserPlus className="h-3 w-3 text-purple-600 flex-shrink-0" />
                )}
                {guest.allergies && (
                  <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {guest.gruppo && (
                  <>
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_ICONS[guest.gruppo as keyof typeof CATEGORY_ICONS] || guest.gruppo}
                    </Badge>
                  </>
                )}
                {guest.fascia_eta && (
                  <Badge variant="secondary" className="text-xs">
                    {AGE_GROUP_ICONS[guest.fascia_eta as keyof typeof AGE_GROUP_ICONS] || guest.fascia_eta}
                  </Badge>
                )}
              </div>
              
              {guest.allergies && (
                <div className="flex items-start gap-2 text-warning mt-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="self-end text-xs">
                    Allergie: {guest.allergies}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Tipo ospite badge */}
              {/*<Badge 
                variant={guest.is_principale ? "default" : "secondary"} 
                className="text-xs"
              >
                {guest.is_principale ? 'Principale' : 'Accompagnatore'}
              </Badge>*/}
              
              {/* Remove button */}
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          {/* Notes preview - show only non-allergy notes */}
          {guest.note && (() => {
            try {
              const parsedNote = JSON.parse(guest.note);
              // If it's JSON, check for other fields besides allergies
              const otherNotes = Object.entries(parsedNote)
                .filter(([key]) => key !== 'allergies' && key !== 'deleted_at')
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              return otherNotes ? (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {otherNotes}
                </p>
              ) : null;
            } catch (error) {
              // If not JSON, show the note as is (it might contain allergies info)
              return (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {guest.note}
                </p>
              );
            }
          })()}
        </CardContent>
      </Card>
      
      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Rimuovi Ospite"
        description={`Sei sicuro di voler rimuovere ${guest.nome_visualizzato} dal tavolo? L'ospite tornerà nella lista non assegnati.`}
        confirmText="Rimuovi"
        cancelText="Annulla"
        onConfirm={handleConfirmRemove}
        variant="destructive"
      />
    </>
  );
};

export default DraggableGuest;