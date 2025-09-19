import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, AlertCircle, UserPlus } from "lucide-react";
import { SeatingGuest } from "@/hooks/useSeating";

interface Table {
  id: number;
  nome_tavolo: string;
  capacita_max: number;
  currentGuests: number;
}

interface UnassignedGuestsProps {
  guests: SeatingGuest[];
  tables: Table[];
  onAssignMultipleGuests: (guestIds: number[], tableId: number) => Promise<void>;
}

const UnassignedGuests: React.FC<UnassignedGuestsProps> = ({ 
  guests, 
  tables, 
  onAssignMultipleGuests 
}) => {
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const confirmedGuests = guests.filter(g => g.confermato === true);
  const pendingGuests = guests.filter(g => g.confermato !== true);

  const handleGuestSelect = (guestId: number, checked: boolean) => {
    if (checked) {
      setSelectedGuests(prev => [...prev, guestId]);
    } else {
      setSelectedGuests(prev => prev.filter(id => id !== guestId));
    }
  };

  const handleSelectAll = (guestList: SeatingGuest[], checked: boolean) => {
    const guestIds = guestList.map(g => g.id);
    if (checked) {
      setSelectedGuests(prev => [...prev, ...guestIds.filter(id => !prev.includes(id))]);
    } else {
      setSelectedGuests(prev => prev.filter(id => !guestIds.includes(id)));
    }
  };

  const handleAssign = async () => {
    if (!selectedTable || selectedGuests.length === 0) return;
    
    setIsAssigning(true);
    try {
      await onAssignMultipleGuests(selectedGuests, parseInt(selectedTable));
      setSelectedGuests([]);
      setSelectedTable("");
    } finally {
      setIsAssigning(false);
    }
  };

  const getAvailableSpots = (table: Table) => {
    return table.capacita_max - table.currentGuests;
  };

  const renderGuestList = (guestList: SeatingGuest[], title: string, titleColor: string) => {
    if (guestList.length === 0) return null;

    const allSelected = guestList.every(g => selectedGuests.includes(g.id));
    const someSelected = guestList.some(g => selectedGuests.includes(g.id));

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium flex items-center gap-2 ${titleColor}`}>
            <Users className="h-4 w-4" />
            {title} ({guestList.length})
          </h4>
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => handleSelectAll(guestList, checked as boolean)}
            className="mr-2"
          />
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {guestList.map((guest) => (
            <div 
              key={guest.id} 
              className="flex items-center space-x-3 p-2 bg-card rounded-lg border"
            >
              <Checkbox
                checked={selectedGuests.includes(guest.id)}
                onCheckedChange={(checked) => handleGuestSelect(guest.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{guest.nome_visualizzato}</p>
                {guest.gruppo && (
                  <p className="text-xs text-muted-foreground truncate">{guest.gruppo}</p>
                )}
                {guest.note && (
                  <p className="text-xs text-muted-foreground/80 truncate">{guest.note}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {guest.confermato === true && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Conf.
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
          Seleziona gli ospiti e scegli un tavolo per l'assegnazione
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {guests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              Tutti gli ospiti sono stati assegnati ai tavoli!
            </p>
          </div>
        ) : (
          <>
            {/* Assignment Controls */}
            {selectedGuests.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">
                    {selectedGuests.length} ospiti selezionati
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGuests([])}
                  >
                    Deseleziona tutti
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleziona tavolo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => {
                        const availableSpots = getAvailableSpots(table);
                        const canAccommodate = availableSpots >= selectedGuests.length;
                        return (
                          <SelectItem 
                            key={table.id} 
                            value={table.id.toString()}
                            disabled={!canAccommodate}
                          >
                            {table.nome_tavolo} ({availableSpots}/{table.capacita_max} liberi)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAssign}
                    disabled={!selectedTable || selectedGuests.length === 0 || isAssigning}
                    className="shrink-0"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isAssigning ? "Assegnando..." : "Assegna"}
                  </Button>
                </div>
              </div>
            )}

            {/* Guest Lists */}
            <div className="space-y-6">
              {renderGuestList(
                confirmedGuests, 
                "Confermati", 
                "text-green-700 dark:text-green-300"
              )}
              {renderGuestList(
                pendingGuests, 
                "In Attesa", 
                "text-muted-foreground"
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UnassignedGuests;