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
import { Guest, CATEGORY_LABELS, GuestStatus, AGE_GROUP_LABELS, AgeGroup } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
}

const GuestList = ({ guests, type, emptyMessage, companionLoading, confirmGuest, confirmGuestOnly, revertGuestOnly, confirmGuestAndAllCompanions, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuest, updateGuestStatus, updateCompanionStatus, confirmCompanion, deleteCompanion, restoreCompanion, permanentlyDeleteCompanion }: GuestListProps) => {
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
    onConfirm: () => {}
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
                {/* Mobile: nome + icone | Desktop: come prima */}
                  <div className="flex flex-col gap-2 mb-3">
                    {/* Prima riga: Nome + Icone */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-foreground break-words flex-1 min-w-0">
                        {guest.name}
                      </h3>
                      
                      {/* Action buttons - sempre sulla stessa linea del nome */}
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
                                className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs bg-success/10 hover:bg-success/20 text-success"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span className="hidden sm:inline sm:ml-1">Conferma</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline sm:ml-1">Elimina</span>
                              </Button>
                            </>
                          )}
                          {guest.status === 'confirmed' && (
                            <>
                              <Button
                                onClick={() => handleRevertMainOnly(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-primary hover:bg-primary/10"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline sm:ml-1">Ripristina</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline sm:ml-1">Elimina</span>
                              </Button>
                            </>
                          )}
                          {type === "deleted" && guest.status === 'deleted' && (
                            <>
                              <Button
                                onClick={() => handleRestore(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-primary hover:bg-primary/10"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline sm:ml-1">Ripristina</span>
                              </Button>
                              <Button
                                onClick={() => handlePermanentDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline sm:ml-1">Elimina</span>
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Seconda riga: Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[guest.category]}
                      </Badge>
                      {guest.ageGroup && (
                        <Badge variant="outline" className="text-xs">
                          {AGE_GROUP_LABELS[guest.ageGroup]}
                        </Badge>
                      )}
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
                            <div key={companion.id} className="flex items-start justify-between gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                                <span className="text-sm font-medium break-words">{companion.name}</span>
                                <div className="flex flex-wrap items-center gap-2">
                                  {companion.ageGroup && (
                                    <Badge variant="outline" className="text-xs">
                                      {AGE_GROUP_LABELS[companion.ageGroup]}
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={
                                      companion.status === 'confirmed' ? 'default' : 
                                      companion.status === 'pending' ? 'secondary' : 
                                      'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {companion.status === 'confirmed' ? 'Confermato' : 
                                     companion.status === 'pending' ? 'Da confermare' : 
                                     'Eliminato'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Show companion actions regardless of main guest status if companion is pending */}
                                  {companion.status === 'pending' && (
                                    <>
                                      <Button
                                        onClick={() => confirmCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs bg-success/10 hover:bg-success/20 text-success"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <UserCheck className="w-4 h-4" />
                                        <span className="hidden sm:inline sm:ml-1">Conferma</span>
                                      </Button>
                                      <Button
                                        onClick={() => deleteCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline sm:ml-1">Elimina</span>
                                      </Button>
                                    </>
                                  )}
                                  {/* Show delete for confirmed companions */}
                                  {companion.status === 'confirmed' && (
                                    <>
                                      <Button
                                        onClick={() => {
                                          // Change companion status to pending
                                          updateCompanionStatus(guest.id, companion.id, 'pending');
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-primary hover:bg-primary/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="hidden sm:inline sm:ml-1">Ripristina</span>
                                      </Button>
                                      <Button
                                        onClick={() => deleteCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline sm:ml-1">Elimina</span>
                                      </Button>
                                    </>
                                  )}
                                  {/* Show restore for deleted companions */}
                                  {type === "deleted" && companion.status === 'deleted' && (
                                    <>
                                      <Button
                                        onClick={() => restoreCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-primary hover:bg-primary/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        <span className="hidden sm:inline sm:ml-1">Ripristina</span>
                                      </Button>
                                       <Button
                                         onClick={() => {
                                           setDeleteDialog({
                                             open: true,
                                             title: "Elimina definitivamente accompagnatore",
                                             description: `Eliminare definitivamente ${companion.name}?`,
                                             onConfirm: () => permanentlyDeleteCompanion(guest.id, companion.id)
                                           });
                                         }}
                                         size="sm"
                                         variant="ghost"
                                         className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-destructive hover:bg-destructive/10"
                                         disabled={companionLoading === companion.id}
                                       >
                                         <Trash2 className="w-4 h-4" />
                                         <span className="hidden sm:inline sm:ml-1">Elimina</span>
                                       </Button>
                                    </>
                                  )}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(guest.allergies || guest.companions.some(comp => comp.allergies)) && (
                      <div className="flex items-start gap-2 text-warning">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          {guest.allergies && (
                            <div>{guest.name}: {guest.allergies}</div>
                          )}
                          {guest.companions.filter(comp => comp.allergies).map(comp => (
                            <div key={comp.id}>{comp.name}: {comp.allergies}</div>
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