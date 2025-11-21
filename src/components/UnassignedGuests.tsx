import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, AlertCircle, UserPlus, AlertTriangle, Crown } from "lucide-react";
import { SeatingGuest } from "@/hooks/useSeating";
import { CATEGORY_LABELS, AGE_GROUP_LABELS, CATEGORY_ICONS, AGE_GROUP_ICONS } from "@/types/guest";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

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
  const [groupFilter, setGroupFilter] = useState<string>("all");

  // Filtra gli ospiti in base al gruppo
  const filteredGuests = guests.filter(guest => {
    if (groupFilter === "all") return true;
    return guest.gruppo === groupFilter;
  });

  const confirmedGuests = filteredGuests.filter(g => g.confermato === true);
  const pendingGuests = filteredGuests.filter(g => g.confermato !== true);

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
        <div className="max-h-80 overflow-y-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 w-full">
            {guestList.map((guest) => (
              <div
                key={guest.id}
                className={`flex items-center space-x-2 p-1.5 rounded-lg border transition-colors w-full ${guest.gruppo === 'family-his'
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                    : guest.gruppo === 'family-hers'
                      ? 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800'
                      : guest.gruppo === 'friends'
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                        : guest.gruppo === 'colleagues'
                          ? 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700'
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800'
                  }`}
              >
                <Checkbox
                  checked={selectedGuests.includes(guest.id)}
                  onCheckedChange={(checked) => handleGuestSelect(guest.id, checked as boolean)}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Icona allergie con tooltip - prima del nome */}
                    {guest.allergies && (
                      <SimpleTooltip
                        content={
                          <div className="space-y-1">
                            <div className="font-semibold text-xs">Allergie:</div>
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

                    <p className="text-xs font-medium truncate flex-shrink">{guest.nome_visualizzato}</p>

                    {/* Badge inline con il nome */}
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
                {/* badge "Conf." rimosso */}
              </div>
            ))}
          </div>
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
            {filteredGuests.length}
          </Badge>
        </div>

        {/* Filtro per gruppo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium">Filtra per gruppo:</label>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i gruppi</SelectItem>
              <SelectItem value="family-his">Famiglia di lui</SelectItem>
              <SelectItem value="family-hers">Famiglia di lei</SelectItem>
              <SelectItem value="friends">Amici</SelectItem>
              <SelectItem value="colleagues">Colleghi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          Seleziona gli ospiti e scegli un tavolo per l'assegnazione
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              {groupFilter === "all"
                ? "Tutti gli ospiti sono stati assegnati ai tavoli!"
                : `Nessun ospite nel gruppo selezionato da assegnare`}
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
              {renderGuestList(confirmedGuests, "Confermati", "text-green-700 dark:text-green-300")}
              {renderGuestList(pendingGuests, "In Attesa", "text-muted-foreground")}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UnassignedGuests;
