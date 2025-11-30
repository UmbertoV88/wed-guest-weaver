import React, { useState } from "react";
import { useDrag } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Crown, Users, UserPlus, AlertTriangle } from "lucide-react";
import { SeatingGuest } from "@/hooks/useSeating";
import { CATEGORY_LABELS, AGE_GROUP_LABELS, CATEGORY_ICONS, AGE_GROUP_ICONS } from "@/types/guest";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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

        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Icona allergie con tooltip - prima del nome */}
                {guest.allergies && (
                  <SimpleTooltip
                    content={
                      <div className="space-y-1">
                        <div className="font-semibold text-xs">{t('guests.fields.allergies')}:</div>
                        <div className="text-xs">{guest.allergies}</div>
                      </div>
                    }
                    className="bg-white border-2 border-yellow-400 shadow-lg text-yellow-800 font-medium"
                  >
                    <span className="inline-block">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning cursor-pointer flex-shrink-0" />
                    </span>
                  </SimpleTooltip>
                )}

                <p className="font-medium text-xs truncate flex-shrink">
                  {guest.nome_visualizzato}
                </p>

                {/* Badge categoria e età inline - solo emoticon */}
                {guest.gruppo && (
                  <span className="text-xs flex-shrink-0">
                    {CATEGORY_ICONS[guest.gruppo as keyof typeof CATEGORY_ICONS]}
                  </span>
                )}
                {guest.fascia_eta && (
                  <span className="text-xs flex-shrink-0">
                    {AGE_GROUP_ICONS[guest.fascia_eta as keyof typeof AGE_GROUP_ICONS]}
                  </span>
                )}
              </div>
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
        title={t('seating.removeGuest')}
        description={t('seating.removeGuestDescription', { name: guest.nome_visualizzato })}
        confirmText={t('common.confirm.remove')}
        cancelText={t('common.button.cancel')}
        onConfirm={handleConfirmRemove}
        variant="destructive"
      />
    </>
  );
};

export default DraggableGuest;