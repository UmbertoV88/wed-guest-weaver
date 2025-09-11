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
import { Guest, CATEGORY_LABELS, GuestStatus } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";

interface GuestListProps {
  guests: Guest[];
  type: "pending" | "confirmed" | "deleted";
  emptyMessage: string;
  confirmGuest: (guestId: string) => Promise<any>;
  restoreGuest: (guestId: string) => Promise<any>;
  deleteGuest: (guestId: string) => Promise<any>;
  permanentlyDeleteGuest: (guestId: string) => Promise<any>;
  updateGuestStatus: (guestId: string, status: GuestStatus) => Promise<any>;
}

const GuestList = ({ guests, type, emptyMessage, confirmGuest, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuestStatus }: GuestListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  // Filter guests based on search and category
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.companions.some(comp => comp.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || guest.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleConfirm = async (guestId: string, guestName: string) => {
    try {
      await confirmGuest(guestId);
      toast({
        title: "Invitato confermato!",
        description: `${guestName} è stato confermato per il matrimonio.`,
      });
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
      toast({
        title: "Invitato ripristinato!",
        description: `${guestName} è stato ripristinato nell'elenco.`,
      });
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
      toast({
        title: "Invitato eliminato",
        description: `${guestName} è stato spostato nel cestino.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione.",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (guestId: string, guestName: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare definitivamente ${guestName}? Questa azione non può essere annullata.`)) {
      try {
        await permanentlyDeleteGuest(guestId);
        toast({
          title: "Invitato eliminato definitivamente",
          description: `${guestName} è stato rimosso permanentemente.`,
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione permanente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConfirmedToending = async (guestId: string, guestName: string) => {
    try {
      await updateGuestStatus(guestId, 'pending');
      toast({
        title: "Invitato riportato a da confermare!",
        description: `${guestName} è stato riportato nello stato da confermare.`,
      });
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca invitati..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {guest.name}
                    </h3>
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[guest.category]}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {guest.companions.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {guest.companions.length} accompagnator{guest.companions.length === 1 ? 'e' : 'i'}: {' '}
                          {guest.companions.map(comp => comp.name).join(', ')}
                        </span>
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
                  {type === "pending" && (
                    <>
                      <Button
                        onClick={() => handleConfirm(guest.id, guest.name)}
                        size="sm"
                        className="bg-success hover:bg-success/90 text-white"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Conferma
                      </Button>
                      <Button
                        onClick={() => handleDelete(guest.id, guest.name)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Elimina
                      </Button>
                    </>
                  )}
                  
                  {type === "confirmed" && (
                    <Button
                      onClick={() => handleConfirmedToending(guest.id, guest.name)}
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestList;