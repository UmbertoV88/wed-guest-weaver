import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Trash2 } from "lucide-react";
import { useGuests } from "@/hooks/useGuests";
import GuestList from "./GuestList";
import GuestStats from "./GuestStats";

const GuestTabs = () => {
  const { getGuestsByStatus, getStats } = useGuests();
  
  const stats = getStats();
  const pendingGuests = getGuestsByStatus('pending');
  const confirmedGuests = getGuestsByStatus('confirmed');
  const deletedGuests = getGuestsByStatus('deleted');

  return (
    <div className="w-full">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger 
            value="pending" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-romantic"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Da confermare</span>
            <Badge variant="secondary" className="ml-1">
              {stats.pending}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="confirmed"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-romantic"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Confermati</span>
            <Badge variant="secondary" className="ml-1">
              {stats.confirmed}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="deleted"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-romantic"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Eliminati</span>
            <Badge variant="secondary" className="ml-1">
              {stats.deleted}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <GuestStats />
        </div>

        <TabsContent value="pending" className="mt-6 animate-fade-in-up">
          <GuestList 
            guests={pendingGuests} 
            type="pending"
            emptyMessage="Nessun invitato da confermare. Aggiungi il primo invitato!"
          />
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6 animate-fade-in-up">
          <GuestList 
            guests={confirmedGuests} 
            type="confirmed"
            emptyMessage="Nessun invitato confermato ancora."
          />
        </TabsContent>

        <TabsContent value="deleted" className="mt-6 animate-fade-in-up">
          <GuestList 
            guests={deletedGuests} 
            type="deleted"
            emptyMessage="Nessun invitato eliminato."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuestTabs;