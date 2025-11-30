import { Card } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Crown } from "lucide-react";
import { CATEGORY_LABELS, Guest, GuestStatus } from "@/types/guest";
import ExportButton from "./ExportButton";
import { useTranslation } from "react-i18next";

interface GuestStatsProps {
  stats: {
    total: number;
    totalWithCompanions: number;
    confirmed: number;
    pending: number;
    deleted: number;
    byCategory: Record<string, number>;
  };
  getAllGuests: () => Guest[];
  getGuestsByStatus: (status: GuestStatus) => Guest[];
}

const GuestStats = ({ stats, getAllGuests, getGuestsByStatus }: GuestStatsProps) => {
  const { t } = useTranslation();

  const statCards = [
    {
      title: t('dashboard.stats.totalGuests'),
      value: stats.totalWithCompanions,
      subtitle: `${stats.total} ${t('dashboard.stats.subtitles.total')}`,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      title: t('dashboard.stats.confirmed'),
      value: stats.confirmed,
      subtitle: t('dashboard.stats.subtitles.confirmed'),
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/5"
    },
    {
      title: t('dashboard.stats.pending'),
      value: stats.pending,
      subtitle: t('dashboard.stats.subtitles.pending'),
      icon: Calendar,
      color: "text-warning",
      bg: "bg-warning/5"
    },
    {
      title: t('dashboard.stats.perCategory'),
      value: Object.keys(stats.byCategory).length,
      subtitle: t('dashboard.stats.subtitles.categories'),
      icon: Crown,
      color: "text-gold",
      bg: "bg-gold/5"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton
          getAllGuests={getAllGuests}
          getGuestsByStatus={getGuestsByStatus}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {t('dashboard.stats.categoryDistribution')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
    </div>
  );
};

export default GuestStats;