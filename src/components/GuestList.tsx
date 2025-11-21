import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserCheck,
  RotateCcw,
  Trash2,
  Users,
  AlertTriangle,
  Filter
} from "lucide-react";
import EditGuestForm from "@/components/EditGuestForm";
import { Guest, CATEGORY_LABELS, GuestStatus, AGE_GROUP_LABELS, AgeGroup, CATEGORY_ICONS, AGE_GROUP_ICONS } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

interface GuestListProps {
  guests: Guest[];
  type: "pending" | "confirmed" | "deleted";
  emptyMessage: string;
  companionLoading?: string | null;
  confirmGuest: (guestId: string) => Promise<any>;
  confirmGuestOnly: (guestId: string) => Promise<any>;
  revertGuestOnly: (guestId: string) => Promise<any>;
  confirmGuestAndAllCompanions: (guestId: string) => Promise<any>;
  restoreGuest: (guestId: string) => Promise<any>;
  deleteGuest: (guestId: string) => Promise<any>;
  permanentlyDeleteGuest: (guestId: string) => Promise<any>;
  updateGuest: (guestId: string, formData: any) => Promise<any>;
  updateGuestStatus: (guestId: string, status: GuestStatus) => Promise<any>;
  updateCompanionStatus: (guestId: string, companionId: string, status: GuestStatus) => Promise<any>;
  confirmCompanion: (guestId: string, companionId: string) => Promise<any>;
  deleteCompanion: (guestId: string, companionId: string) => Promise<any>;
  restoreCompanion: (guestId: string, companionId: string) => Promise<any>;
  permanentlyDeleteCompanion: (guestId: string, companionId: string) => Promise<any>;
  toggleBomboniera?: (invitatiId: string, checked: boolean) => Promise<any>;
}

const GuestList = ({ guests, type, emptyMessage, companionLoading, confirmGuest, confirmGuestOnly, revertGuestOnly, confirmGuestAndAllCompanions, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuest, updateGuestStatus, updateCompanionStatus, confirmCompanion, deleteCompanion, restoreCompanion, permanentlyDeleteCompanion, toggleBomboniera }: GuestListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => { }
  });
  const { toast } = useToast();

  // Filter guests based on search and category
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.companions.some(comp => comp.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || guest.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleConfirmMainOnly = async (guestId: string, guestName: string) => {
    try {
      await confirmGuestOnly(guestId);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (guestId: string, guestName: string) => {
    try {
      await restoreGuest(guestId);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il ripristino.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (guestId: string, guestName: string) => {
    try {
      await deleteGuest(guestId);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione.",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (guestId: string, guestName: string) => {
    setDeleteDialog({
      open: true,
      title: "Elimina definitivamente invitato",
      description: `Sei sicuro di voler eliminare definitivamente ${guestName}? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          await permanentlyDeleteGuest(guestId);
        } catch (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'eliminazione permanente.",
            variant: "destructive",
          });
        }
      }
    });
  };

  const handleRevertMainOnly = async (guestId: string, guestName: string) => {
    try {
      await revertGuestOnly(guestId);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'operazione.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmAll = async (guestId: string, guestName: string) => {
    try {
      await confirmGuestAndAllCompanions(guestId);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma del gruppo.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmedToPending = async (guestId: string, guestName: string) => {
    try {
      await updateGuestStatus(guestId, 'pending');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'operazione.",
        variant: "destructive",
      });
    }
  };

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <Card className="p-4 shadow-soft border-primary/10">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca invitati..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full sm:w-auto"
            >
              <option value="all">Tutte le categorie</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          Visualizzando {filteredGuests.length} di {guests.length} invitati
        </div>
      </Card>

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <Card className="p-8 text-center shadow-soft border-primary/10">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || selectedCategory !== "all" ? "Nessun risultato" : "Lista vuota"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== "all"
              ? "Prova a modificare i filtri di ricerca."
              : emptyMessage
            }
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGuests.map((guest, index) => (
            <Card
              key={guest.id}
              className="p-4 shadow-soft border-primary/10 hover:shadow-elegant transition-romantic animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  {/* Layout ottimizzato per mobile */}
                  <div className="flex flex-col gap-2 mb-3">
                    {/* Prima riga: Nome + Bomboniera checkbox (sempre insieme) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
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
                              <AlertTriangle className="w-4 h-4 text-warning cursor-pointer flex-shrink-0" />
                            </span>
                          </SimpleTooltip>
                        )}

                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {guest.name}
                        </h3>

                        {/* Bomboniera checkbox - sempre accanto al nome */}
                        {guest.status === 'confirmed' && toggleBomboniera && guest.containsPrimary && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-pink-50 rounded-md border border-pink-200 flex-shrink-0">
                            <Checkbox
                              id={`bomboniera-${guest.id}`}
                              checked={guest.bombonieraAssegnata || false}
                              onCheckedChange={(checked) => {
                                toggleBomboniera(guest.primaryDbId || guest.id, checked as boolean);
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`bomboniera-${guest.id}`}
                              className="cursor-pointer text-base leading-none"
                            >
                              🎁
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Action buttons - icone su mobile, con label su desktop */}
                      {guest.containsPrimary && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Edit button - available for all statuses */}
                          <EditGuestForm guest={guest} updateGuest={updateGuest} />

                          {guest.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleConfirmMainOnly(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs bg-success/10 hover:bg-success/20 text-success"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">Conferma</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">Elimina</span>
                              </Button>
                            </>
                          )}
                          {guest.status === 'confirmed' && (
                            <>
                              <Button
                                onClick={() => handleRevertMainOnly(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-primary hover:bg-primary/10"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">Ripristina</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">Elimina</span>
                              </Button>
                            </>
                          )}
                          {type === "deleted" && guest.status === 'deleted' && (
                            <>
                              <Button
                                onClick={() => handleRestore(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-primary hover:bg-primary/10"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">Ripristina</span>
                              </Button>
                              <Button
                                onClick={() => handlePermanentDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">Elimina</span>
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Seconda riga: Badges (categoria e età) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const categoryIcon = CATEGORY_ICONS[guest.category as keyof typeof CATEGORY_ICONS] || guest.category;
                        const badge = (
                          <Badge variant="outline" className="text-xs cursor-pointer">
                            {categoryIcon}
                          </Badge>
                        );

                        // Tooltip personalizzati per categoria
                        switch (guest.category) {
                          case "family-hers":
                            return (
                              <SimpleTooltip
                                content="Famiglia della Sposa"
                                className="bg-white border-2 border-pink-300 shadow-lg text-pink-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          case "family-his":
                            return (
                              <SimpleTooltip
                                content="Famiglia dello Sposo"
                                className="bg-white border-2 border-blue-300 shadow-lg text-blue-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          case "friends":
                            return (
                              <SimpleTooltip
                                content="Amici"
                                className="bg-white border-2 border-gray-300 shadow-lg text-gray-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          case "colleagues":
                            return (
                              <SimpleTooltip
                                content="Colleghi"
                                className="bg-white border-2 border-gray-300 shadow-lg text-gray-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          default:
                            return badge;
                        }
                      })()}
                      {guest.ageGroup && (() => {
                        const ageIcon = AGE_GROUP_ICONS[guest.ageGroup as keyof typeof AGE_GROUP_ICONS] || guest.ageGroup;
                        const ageBadge = (
                          <Badge variant="secondary" className="text-xs cursor-pointer">
                            {ageIcon}
                          </Badge>
                        );

                        // Tooltip personalizzati per età
                        switch (guest.ageGroup) {
                          case "Adulto":
                            return (
                              <SimpleTooltip
                                content="Adulto"
                                className="bg-white border-2 border-green-300 shadow-lg text-green-700 font-medium"
                              >
                                <span className="inline-block">{ageBadge}</span>
                              </SimpleTooltip>
                            );
                          case "Ragazzo":
                            return (
                              <SimpleTooltip
                                content="Ragazzo"
                                className="bg-white border-2 border-orange-300 shadow-lg text-orange-700 font-medium"
                              >
                                <span className="inline-block">{ageBadge}</span>
                              </SimpleTooltip>
                            );
                          case "Bambino":
                            return (
                              <SimpleTooltip
                                content="Bambino"
                                className="bg-white border-2 border-purple-300 shadow-lg text-purple-700 font-medium"
                              >
                                <span className="inline-block">{ageBadge}</span>
                              </SimpleTooltip>
                            );
                          default:
                            return ageBadge;
                        }
                      })()}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {guest.companions.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                          <Users className="w-3 h-3" />
                          <span>Accompagnatori:</span>
                        </div>
                        <div className="pl-3 sm:pl-5 space-y-3">
                          {guest.companions.map(companion => (
                            <div key={companion.id} className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                                  <div className="flex items-start gap-2">
                                    {/* Icona allergie allineata con l'icona Users - fuori dal padding */}
                                    <div className="flex items-center" style={{ marginLeft: '-1rem' }}>
                                      {companion.allergies ? (
                                        <SimpleTooltip
                                          content={
                                            <div className="space-y-1">
                                              <div className="font-semibold text-xs">Allergie:</div>
                                              <div className="text-xs">{companion.allergies}</div>
                                            </div>
                                          }
                                          className="bg-white border-2 border-yellow-400 shadow-lg text-yellow-800 font-medium"
                                        >
                                          <span className="inline-block">
                                            <AlertTriangle className="w-4 h-4 text-warning cursor-pointer flex-shrink-0" />
                                          </span>
                                        </SimpleTooltip>
                                      ) : (
                                        <span className="w-4 h-4 flex-shrink-0" />
                                      )}
                                    </div>
                                    <span className="text-sm font-medium break-words">{companion.name}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {companion.ageGroup && (() => {
                                      const ageIcon = AGE_GROUP_ICONS[companion.ageGroup as keyof typeof AGE_GROUP_ICONS] || companion.ageGroup;
                                      const ageBadge = (
                                        <Badge variant="secondary" className="text-xs cursor-pointer">
                                          {ageIcon}
                                        </Badge>
                                      );

                                      // Tooltip personalizzati per età
                                      switch (companion.ageGroup) {
                                        case "Adulto":
                                          return (
                                            <SimpleTooltip
                                              content="Adulto"
                                              className="bg-white border-2 border-green-300 shadow-lg text-green-700 font-medium"
                                            >
                                              <span className="inline-block">{ageBadge}</span>
                                            </SimpleTooltip>
                                          );
                                        case "Ragazzo":
                                          return (
                                            <SimpleTooltip
                                              content="Ragazzo"
                                              className="bg-white border-2 border-orange-300 shadow-lg text-orange-700 font-medium"
                                            >
                                              <span className="inline-block">{ageBadge}</span>
                                            </SimpleTooltip>
                                          );
                                        case "Bambino":
                                          return (
                                            <SimpleTooltip
                                              content="Bambino"
                                              className="bg-white border-2 border-purple-300 shadow-lg text-purple-700 font-medium"
                                            >
                                              <span className="inline-block">{ageBadge}</span>
                                            </SimpleTooltip>
                                          );
                                        default:
                                          return ageBadge;
                                      }
                                    })()}

                                    {/* Div rosa compatto con checkbox + emoji */}
                                    {companion.status === 'confirmed' && toggleBomboniera && (
                                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-pink-50 rounded-md border border-pink-200">
                                        <Checkbox
                                          id={`bomboniera-comp-${companion.id}`}
                                          checked={companion.bombonieraAssegnata || false}
                                          onCheckedChange={(checked) => {
                                            toggleBomboniera(companion.id, checked as boolean);
                                          }}
                                          className="h-4 w-4"
                                        />
                                        <label
                                          htmlFor={`bomboniera-comp-${companion.id}`}
                                          className="cursor-pointer text-base leading-none"
                                        >
                                          🎁
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Bottoni azioni accompagnatore */}
                                  {companion.status === 'pending' && (
                                    <>
                                      <Button
                                        onClick={() => {
                                          confirmCompanion(guest.id, companion.id);
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs bg-success/10 hover:bg-success/20 text-success"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <UserCheck className="w-4 h-4" />
                                        <span className="hidden lg:inline lg:ml-1">Conferma</span>
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          deleteCompanion(guest.id, companion.id);
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden lg:inline lg:ml-1">Elimina</span>
                                      </Button>
                                    </>
                                  )}
                                  {companion.status === 'confirmed' && (
                                    <>
                                      <Button
                                        onClick={() => {
                                          updateCompanionStatus(guest.id, companion.id, 'pending');
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-primary hover:bg-primary/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="hidden lg:inline lg:ml-1">Ripristina</span>
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          deleteCompanion(guest.id, companion.id);
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden lg:inline lg:ml-1">Elimina</span>
                                      </Button>
                                    </>
                                  )}
                                  {companion.status === 'deleted' && type === 'deleted' && (
                                    <>
                                      <Button
                                        onClick={() => {
                                          restoreCompanion(guest.id, companion.id);
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-primary hover:bg-primary/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="hidden lg:inline lg:ml-1">Ripristina</span>
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setDeleteDialog({
                                            open: true,
                                            title: "Eliminare definitivamente?",
                                            description: `Sei sicuro di voler eliminare definitivamente ${companion.name}? Questa azione non può essere annullata.`,
                                            onConfirm: () => {
                                              permanentlyDeleteCompanion(guest.id, companion.id);
                                              setDeleteDialog({ ...deleteDialog, open: false });
                                            }
                                          });
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden lg:inline lg:ml-1">Elimina</span>
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Show group actions only for cards that contain the primary guest */}
                  {guest.containsPrimary && (
                    <>
                      {type === "pending" && (
                        <>
                          {/* Show "Conferma tutto" and "Elimina tutto" only if there are companions */}
                          {guest.companions.length > 0 && guest.companions.some(comp => comp.status === 'pending') && (
                            <Button
                              onClick={() => handleConfirmAll(guest.id, guest.name)}
                              size="sm"
                              className="bg-success hover:bg-success/90 text-white"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Conferma tutto
                            </Button>
                          )}
                          {guest.companions.length > 0 && (
                            <Button
                              onClick={() => handleDelete(guest.id, guest.name)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Elimina tutto
                            </Button>
                          )}
                        </>
                      )}

                      {type === "confirmed" && (
                        <Button
                          onClick={() => handleConfirmedToPending(guest.id, guest.name)}
                          size="sm"
                          variant="outline"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Riporta a da confermare
                        </Button>
                      )}

                      {type === "deleted" && (
                        <>
                          <Button
                            onClick={() => handleRestore(guest.id, guest.name)}
                            size="sm"
                            variant="outline"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Ripristina
                          </Button>
                          <Button
                            onClick={() => handlePermanentDelete(guest.id, guest.name)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Elimina per sempre
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={deleteDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
};

export default GuestList;