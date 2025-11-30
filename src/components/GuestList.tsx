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

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { useTranslation } from "react-i18next";

interface GuestListProps {
  guests: Guest[];
  type: "pending" | "confirmed" | "deleted";
  emptyMessage: string;
  companionLoading?: string | null;
  confirmGuest: (guestId: string) => Promise<void>;
  confirmGuestOnly: (guestId: string) => Promise<void>;
  revertGuestOnly: (guestId: string) => Promise<void>;
  confirmGuestAndAllCompanions: (guestId: string) => Promise<void>;
  restoreGuest: (guestId: string) => Promise<void>;
  deleteGuest: (guestId: string) => Promise<void>;
  permanentlyDeleteGuest: (guestId: string) => Promise<void>;
  updateGuest: (guestId: string, formData: unknown) => Promise<void>;
  updateGuestStatus: (guestId: string, status: GuestStatus) => Promise<void>;
  updateCompanionStatus: (guestId: string, companionId: string, status: GuestStatus) => Promise<void>;
  confirmCompanion: (guestId: string, companionId: string) => Promise<void>;
  deleteCompanion: (guestId: string, companionId: string) => Promise<void>;
  restoreCompanion: (guestId: string, companionId: string) => Promise<void>;
  permanentlyDeleteCompanion: (guestId: string, companionId: string) => Promise<void>;
  toggleBomboniera?: (invitatiId: string, checked: boolean) => Promise<void>;
}

const GuestList = ({ guests, type, emptyMessage, companionLoading, confirmGuest, confirmGuestOnly, revertGuestOnly, confirmGuestAndAllCompanions, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuest, updateGuestStatus, updateCompanionStatus, confirmCompanion, deleteCompanion, restoreCompanion, permanentlyDeleteCompanion, toggleBomboniera }: GuestListProps) => {
  const { t } = useTranslation();
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
      console.error('Confirm guest error:', error);
    }
  };

  const handleRestore = async (guestId: string, guestName: string) => {
    try {
      await restoreGuest(guestId);
    } catch (error) {
      console.error('Restore guest error:', error);
    }
  };

  const handleDelete = async (guestId: string, guestName: string) => {
    try {
      await deleteGuest(guestId);
    } catch (error) {
      console.error('Delete guest error:', error);
    }
  };

  const handlePermanentDelete = async (guestId: string, guestName: string) => {
    setDeleteDialog({
      open: true,
      title: t('guests.deleteDialog.title'),
      description: t('guests.deleteDialog.description', { name: guestName }),
      onConfirm: async () => {
        try {
          await permanentlyDeleteGuest(guestId);
        } catch (error) {
          console.error('Permanent delete error:', error);
        }
      }
    });
  };

  const handleRevertMainOnly = async (guestId: string, guestName: string) => {
    try {
      await revertGuestOnly(guestId);
    } catch (error) {
      console.error('Revert guest error:', error);
    }
  };

  const handleConfirmAll = async (guestId: string, guestName: string) => {
    try {
      await confirmGuestAndAllCompanions(guestId);
    } catch (error) {
      console.error('Confirm all error:', error);
    }
  };

  const handleConfirmedToPending = async (guestId: string, guestName: string) => {
    try {
      await updateGuestStatus(guestId, 'pending');
    } catch (error) {
      console.error('Update status error:', error);
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
                placeholder={t('guests.searchPlaceholder')}
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
              <option value="all">{t('guests.categories.all')}</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          {t('guests.showing', { count: filteredGuests.length, total: guests.length })}
        </div>
      </Card>

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <Card className="p-8 text-center shadow-soft border-primary/10">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || selectedCategory !== "all" ? t('guests.empty.search') : t('guests.empty.list')}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== "all"
              ? t('guests.empty.filter')
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
                                <div className="font-semibold text-xs">{t('guests.allergies')}</div>
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
                                <span className="hidden lg:inline lg:ml-1">{t('guests.actions.confirm')}</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">{t('guests.actions.delete')}</span>
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
                                <span className="hidden lg:inline lg:ml-1">{t('guests.actions.restore')}</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">{t('guests.actions.delete')}</span>
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
                                <span className="hidden lg:inline lg:ml-1">{t('guests.actions.restore')}</span>
                              </Button>
                              <Button
                                onClick={() => handlePermanentDelete(guest.id, guest.name)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 lg:w-auto lg:px-3 p-0 lg:p-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden lg:inline lg:ml-1">{t('guests.actions.delete')}</span>
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
                                content={t('guests.categories.family-hers')}
                                className="bg-white border-2 border-pink-300 shadow-lg text-pink-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          case "family-his":
                            return (
                              <SimpleTooltip
                                content={t('guests.categories.family-his')}
                                className="bg-white border-2 border-blue-300 shadow-lg text-blue-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          case "friends":
                            return (
                              <SimpleTooltip
                                content={t('guests.categories.friends')}
                                className="bg-white border-2 border-gray-300 shadow-lg text-gray-700 font-medium"
                              >
                                <span className="inline-block">{badge}</span>
                              </SimpleTooltip>
                            );
                          case "colleagues":
                            return (
                              <SimpleTooltip
                                content={t('guests.categories.colleagues')}
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
                                content={t('guests.ageGroups.adult')}
                                className="bg-white border-2 border-green-300 shadow-lg text-green-700 font-medium"
                              >
                                <span className="inline-block">{ageBadge}</span>
                              </SimpleTooltip>
                            );
                          case "Ragazzo":
                            return (
                              <SimpleTooltip
                                content={t('guests.ageGroups.teen')}
                                className="bg-white border-2 border-orange-300 shadow-lg text-orange-700 font-medium"
                              >
                                <span className="inline-block">{ageBadge}</span>
                              </SimpleTooltip>
                            );
                          case "Bambino":
                            return (
                              <SimpleTooltip
                                content={t('guests.ageGroups.child')}
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
                          <span>{t('guests.companions')}</span>
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
                                              <div className="font-semibold text-xs">{t('guests.allergies')}</div>
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
                                              content={t('guests.ageGroups.adult')}
                                              className="bg-white border-2 border-green-300 shadow-lg text-green-700 font-medium"
                                            >
                                              <span className="inline-block">{ageBadge}</span>
                                            </SimpleTooltip>
                                          );
                                        case "Ragazzo":
                                          return (
                                            <SimpleTooltip
                                              content={t('guests.ageGroups.teen')}
                                              className="bg-white border-2 border-orange-300 shadow-lg text-orange-700 font-medium"
                                            >
                                              <span className="inline-block">{ageBadge}</span>
                                            </SimpleTooltip>
                                          );
                                        case "Bambino":
                                          return (
                                            <SimpleTooltip
                                              content={t('guests.ageGroups.child')}
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
                                        <span className="hidden lg:inline lg:ml-1">{t('guests.actions.confirm')}</span>
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
                                        <span className="hidden lg:inline lg:ml-1">{t('guests.actions.delete')}</span>
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
                                        <span className="hidden lg:inline lg:ml-1">{t('guests.actions.restore')}</span>
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
                                        <span className="hidden lg:inline lg:ml-1">{t('guests.actions.delete')}</span>
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
                                        <span className="hidden lg:inline lg:ml-1">{t('guests.actions.restore')}</span>
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setDeleteDialog({
                                            open: true,
                                            title: t('guests.deleteDialog.companionTitle'),
                                            description: t('guests.deleteDialog.companionDescription', { name: companion.name }),
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
                                        <span className="hidden lg:inline lg:ml-1">{t('guests.actions.delete')}</span>
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
                              {t('guests.actions.confirmAll')}
                            </Button>
                          )}
                          {guest.companions.length > 0 && (
                            <Button
                              onClick={() => handleDelete(guest.id, guest.name)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {t('guests.actions.deleteAll')}
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
                          {t('guests.actions.revertToPending')}
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
                            {t('guests.actions.restore')}
                          </Button>
                          <Button
                            onClick={() => handlePermanentDelete(guest.id, guest.name)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t('guests.actions.permanentDelete')}
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
        confirmText={t('guests.actions.delete')}
        cancelText={t('common.actions.cancel')}
        onConfirm={deleteDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
};

export default GuestList;