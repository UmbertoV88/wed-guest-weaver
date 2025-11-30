import React, { useState } from "react";
import { useDrop } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users } from "lucide-react";
import { Table, SeatingGuest } from "@/hooks/useSeating";
import DraggableGuest from "./DraggableGuest";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useTranslation, Trans } from 'react-i18next';

interface TableCardProps {
  table: Table;
  guests: SeatingGuest[];
  globalCapacity: number;
  onDeleteTable: (tableId: number) => void;
  onMoveGuest: (guestId: number, tableId?: number) => void;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  guests,
  globalCapacity,
  onDeleteTable,
  onMoveGuest,
}) => {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'guest',
    drop: (item: { guestId: number }) => {
      if (guests.length < globalCapacity) {
        onMoveGuest(item.guestId, table.id);
      }
    },
    canDrop: () => guests.length < globalCapacity,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isFull = guests.length >= globalCapacity;
  const isEmpty = guests.length === 0;

  const handleDeleteTable = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDeleteTable(table.id);
  };

  return (
    <>
      <Card
        ref={drop}
        className={`
          min-h-[280px] transition-all duration-200
          ${isOver && canDrop ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}
          ${isOver && !canDrop ? 'ring-2 ring-destructive ring-offset-2 bg-destructive/5' : ''}
          ${isFull ? 'bg-orange-50 dark:bg-orange-950/20' : ''}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {table.nome_tavolo || t('seating.tableNameDefault', { id: table.id })}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteTable}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {guests.length}/{globalCapacity}
              </span>
            </div>

            <div className="flex gap-1">
              {isFull && <Badge variant="destructive">{t('seating.status.full')}</Badge>}
              {isEmpty && <Badge variant="outline">{t('seating.status.empty')}</Badge>}
              {!isFull && !isEmpty && <Badge variant="secondary">{t('seating.status.available')}</Badge>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Drop zone hint when empty */}
          {isEmpty && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('seating.dragGuestsHere')}
                </p>
              </div>
            </div>
          )}

          {/* Guests list */}
          {guests.map((guest) => (
            <DraggableGuest
              key={guest.id}
              guest={guest}
              onMoveGuest={onMoveGuest}
            />
          ))}

          {/* Capacity warning */}
          {isFull && (
            <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-950 rounded text-xs text-orange-800 dark:text-orange-200">
              {t('seating.fullWarning')}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('seating.deleteTable')}
        description={
          guests.length > 0 ? (
            <>
              <p>
                <Trans
                  i18nKey="seating.deleteDialog.containsGuests"
                  values={{ name: table.nome_tavolo, count: guests.length }}
                  components={{ strong: <strong /> }}
                />
              </p>
              <p className="mt-2">{t('seating.deleteTableDescription')}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t('dialogs.confirm.continue')}</p>
            </>
          ) : (
            t('seating.deleteDialog.confirm', { name: table.nome_tavolo })
          )
        }
        confirmText={t('common.button.delete')}
        cancelText={t('common.button.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  );
};

export default TableCard;