import React from "react";
import { useDrag } from 'react-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Crown, Users, UserPlus } from "lucide-react";
import { SeatingGuest } from "@/hooks/useSeating";

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
  const [{ isDragging }, drag] = useDrag({
    type: 'guest',
    item: { guestId: guest.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Rimuovere ${guest.nome_visualizzato} dal tavolo?`)) {
      onMoveGuest(guest.id); // Move to unassigned
    }
  };

  return (
    <Card
      ref={drag}
      className={`
        cursor-move transition-all duration-200 hover:shadow-md
        ${isDragging ? 'opacity-50 transform rotate-2' : ''}
        ${guest.gruppo === 'family-his' ? 
          'ring-1 ring-blue-500/30 bg-blue-50 dark:bg-blue-950/20' : 
          guest.gruppo === 'family-hers' ? 
          'ring-1 ring-purple-500/30 bg-purple-50 dark:bg-purple-950/20' :
          'ring-1 ring-green-500/30 bg-green-50 dark:bg-green-950/20'}
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
                <Crown className="h-3 w-3 text-blue-600 flex-shrink-0" title="Ospite principale" />
              ) : (
                <UserPlus className="h-3 w-3 text-purple-600 flex-shrink-0" title="Accompagnatore" />
              )}
            </div>
            
            {guest.gruppo && (
              <div className="flex items-center gap-1 mt-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground truncate">
                  {guest.gruppo}
                </p>
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
        {/* Notes preview */}
        {guest.note && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {guest.note}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DraggableGuest;