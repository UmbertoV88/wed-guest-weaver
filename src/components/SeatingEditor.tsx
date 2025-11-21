import React, { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSeating } from "@/hooks/useSeating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Download, RotateCcw } from "lucide-react";
import TableCard from "./TableCard";
import UnassignedGuests from "./UnassignedGuests";
import { ConfirmDialog } from "@/components/ConfirmDialog";
//import TrashZone from "./TrashZone";

const SeatingEditor = () => {
  const {
    tables,
    guests,
    assignments,
    globalCapacity,
    isLoading,
    addTable,
    deleteTable,
    moveGuest,
    updateGlobalCapacity,
    assignMultipleGuests,
    exportExcel,
  } = useSeating();

  const [newCapacity, setNewCapacity] = useState(globalCapacity);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleCapacityChange = (value: number) => {
    if (value >= 1) {
      setNewCapacity(value);
      updateGlobalCapacity(value);
    }
  };

  const handleAddTable = () => {
    const tableNumber = tables.length + 1;
    addTable({
      nome_tavolo: `Tavolo ${tableNumber}`,
      capacita_max: globalCapacity,
    });
    setIsAddingTable(true);
    setTimeout(() => setIsAddingTable(false), 1000);
  };

  const handleReset = () => {
    setShowResetDialog(true);
  };

  const handleConfirmReset = () => {
    guests.forEach(guest => {
      if (guest.tableId) {
        moveGuest(guest.id);
      }
    });
  };

  // Get unassigned guests
  const unassignedGuests = guests.filter(guest => !guest.tableId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Caricamento disposizione tavoli...</span>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Impostazioni Tavoli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="capacity">Capienza massima per tavolo</Label>
              
              {/* Container principale: colonna su mobile/tablet, riga su desktop */}
              <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
                
                {/* GRUPPO 1: Input + Aggiungi Tavolo */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-end">
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={newCapacity}
                    onChange={(e) => handleCapacityChange(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  
                  <Button
                    onClick={handleAddTable}
                    disabled={isAddingTable}
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    {isAddingTable ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Aggiungi Tavolo
                  </Button>
                </div>
                
                {/* GRUPPO 2: Scarica CSV + Reset */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={exportExcel} variant="outline" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Esporta Excel
                  </Button>
                  
                  <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Unassigned guests */}
        {unassignedGuests.length > 0 && (
        <UnassignedGuests 
          guests={unassignedGuests} 
          tables={tables.map(table => ({
            ...table,
            currentGuests: assignments.filter(a => a.tavolo_id === table.id).length
          }))}
          onAssignMultipleGuests={assignMultipleGuests}
        />
        )}

        {/* Tables grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
            const tableGuests = guests.filter(guest => guest.tableId === table.id);
            return (
              <TableCard
                key={table.id}
                table={table}
                guests={tableGuests}
                globalCapacity={globalCapacity}
                onDeleteTable={deleteTable}
                onMoveGuest={moveGuest}
              />
            );
          })}
        </div>

        {/* Trash zone 
        <TrashZone onMoveGuest={moveGuest} />*/}

        {/* Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{tables.length}</div>
                <div className="text-sm text-muted-foreground">Tavoli</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{guests.length}</div>
                <div className="text-sm text-muted-foreground">Invitati totali</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {guests.filter(g => g.tableId).length}
                </div>
                <div className="text-sm text-muted-foreground">Assegnati</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {unassignedGuests.length}
                </div>
                <div className="text-sm text-muted-foreground">Non assegnati</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset Assegnazioni"
        description={
          <>
            <p>Sei sicuro di voler resettare tutte le assegnazioni dei tavoli?</p>
            <p className="mt-2 font-semibold">Tutti gli ospiti torneranno nella lista "Non Assegnati".</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Questa azione non può essere annullata.
            </p>
          </>
        }
        confirmText="Reset"
        cancelText="Annulla"
        onConfirm={handleConfirmReset}
        variant="destructive"
      />
    </DndProvider>
  );
};

export default SeatingEditor;