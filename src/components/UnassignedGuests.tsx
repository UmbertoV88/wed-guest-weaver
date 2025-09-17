import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle } from "lucide-react";
import { SeatingGuest } from "@/hooks/useSeating";
import DraggableGuest from "./DraggableGuest";

interface UnassignedGuestsProps {
  guests: SeatingGuest[];
}

const UnassignedGuests: React.FC<UnassignedGuestsProps> = ({ guests }) => {
  const confirmedGuests = guests.filter(g => g.confermato === true);
  const pendingGuests = guests.filter(g => g.confermato !== true);

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Ospiti Non Assegnati
          </CardTitle>
          <Badge variant="outline" className="bg-white dark:bg-gray-950">
            <Users className="h-3 w-3 mr-1" />
            {guests.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Trascina gli ospiti sui tavoli per assegnarli ai posti a sedere
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmed guests first */}
        {confirmedGuests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Confermati ({confirmedGuests.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {confirmedGuests.map((guest) => (
                <DraggableGuest
                  key={guest.id}
                  guest={guest}
                  onMoveGuest={() => {}} // No remove button for unassigned
                  showRemoveButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending guests */}
        {pendingGuests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              In Attesa ({pendingGuests.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {pendingGuests.map((guest) => (
                <DraggableGuest
                  key={guest.id}
                  guest={guest}
                  onMoveGuest={() => {}} // No remove button for unassigned
                  showRemoveButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {guests.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              Tutti gli ospiti sono stati assegnati ai tavoli!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnassignedGuests;