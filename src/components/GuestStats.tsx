import { Card } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Crown } from "lucide-react";
import { useGuests } from "@/hooks/useGuests";
import { CATEGORY_LABELS } from "@/types/guest";

const GuestStats = () => {
  const { getStats } = useGuests();
  const stats = getStats();

  const statCards = [
    {
      title: "Totale Invitati",
      value: stats.totalWithCompanions,
      subtitle: `${stats.total} persone principali`,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      title: "Confermati", 
      value: stats.confirmed,
      subtitle: "Presenza garantita",
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/5"
    },
    {
      title: "Da Confermare",
      value: stats.pending,
      subtitle: "In attesa di risposta",
      icon: Calendar,
      color: "text-warning",
      bg: "bg-warning/5"
    },
    {
      title: "Per Categoria",
      value: Object.keys(stats.byCategory).length,
      subtitle: "Gruppi diversi",
      icon: Crown,
      color: "text-gold",
      bg: "bg-gold/5"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title}
            className="p-4 shadow-soft border-primary/10 hover:shadow-elegant transition-romantic animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}

      {/* Category breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 p-4 shadow-soft border-primary/10 animate-fade-in-up">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Distribuzione per Categoria
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className="bg-gradient-to-br from-primary/10 to-gold/10 rounded-lg p-3 mb-2">
                  <span className="text-lg font-bold text-primary">{count}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default GuestStats;