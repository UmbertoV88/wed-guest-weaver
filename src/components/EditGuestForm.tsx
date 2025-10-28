import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Check,
  X,
  Edit
} from "lucide-react";
import { Guest, CATEGORY_LABELS, AGE_GROUP_LABELS } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { guestFormSchema, GuestFormInput } from "@/schemas/guestSchema";

interface EditGuestFormProps {
  guest: Guest;
  updateGuest: (guestId: string, formData: GuestFormInput) => Promise<void>;
}

const EditGuestForm = ({ guest, updateGuest }: EditGuestFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm<GuestFormInput>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      category: "family-his",
      companionCount: 0,
      companions: [],
      allergies: "",
      ageGroup: "Adulto",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "companions",
  });

  const companionCount = watch("companionCount");
  const category = watch("category");
  const ageGroup = watch("ageGroup");
  const totalSteps = 5;

  useEffect(() => {
    if (isOpen && guest) {
      reset({
        name: guest.name,
        category: guest.category,
        companionCount: guest.companions.length,
        companions: guest.companions.map(c => ({
          name: c.name,
          allergies: c.allergies || "",
          ageGroup: c.ageGroup || "Adulto",
        })),
        allergies: guest.allergies || "",
        ageGroup: guest.ageGroup || "Adulto",
      });
      setCurrentStep(1);
    }
  }, [isOpen, guest, reset]);

  const validateStep = (step: number): boolean => {
    const currentData = watch();

    switch (step) {
      case 1:
        if (!currentData.name?.trim() || !currentData.ageGroup) {
          return false;
        }
        break;
      case 2:
        if (!currentData.category) {
          return false;
        }
        break;
      case 3:
        if (companionCount > 0 && fields.length !== companionCount) {
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateCompanions = (count: number) => {
    const currentCompanions = fields;
    
    if (count > currentCompanions.length) {
      for (let i = currentCompanions.length; i < count; i++) {
        append({ name: "", allergies: "", ageGroup: "Adulto" });
      }
    } else if (count < currentCompanions.length) {
      for (let i = currentCompanions.length - 1; i >= count; i--) {
        remove(i);
      }
    }
    setValue("companionCount", count);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsOpen(false);
  };

  const onSubmit = handleSubmit(async (data: GuestFormInput) => {
    try {
      await updateGuest(guest.id, data);
      resetForm();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la modifica dell'invitato.",
        variant: "destructive",
      });
    }
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Nome dell'invitato</h3>
              <p className="text-muted-foreground">Modifica i dettagli dell'invitato</p>
            </div>
            
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Es: Mario Rossi"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="ageGroup">Fascia d'età *</Label>
              <select
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => setValue("ageGroup", e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${errors.ageGroup ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Seleziona fascia d'età</option>
                {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {errors.ageGroup && (
                <p className="text-destructive text-sm mt-1">{errors.ageGroup.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Categoria invitato</h3>
              <p className="text-muted-foreground">Come classifichi questo invitato?</p>
            </div>
            
            <div className="grid gap-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue("category", key as any)}
                  className={`p-4 rounded-lg border-2 text-left transition-romantic ${
                    category === key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Accompagnatori</h3>
              <p className="text-muted-foreground">Modifica gli accompagnatori di {watch("name")}</p>
            </div>
            
            <div>
              <Label htmlFor="companionCount">Numero di accompagnatori</Label>
              <select
                id="companionCount"
                value={companionCount}
                onChange={(e) => updateCompanions(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {companionCount > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Nome e fascia d'età accompagnatori:</h4>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 p-3 border rounded-lg">
                    <Label className="text-sm font-medium">Accompagnatore {index + 1}</Label>
                    <div>
                      <Label htmlFor={`companion-name-${index}`}>Nome completo *</Label>
                      <Input
                        id={`companion-name-${index}`}
                        {...register(`companions.${index}.name`)}
                        placeholder="Nome completo"
                        className={errors.companions?.[index]?.name ? 'border-destructive' : ''}
                      />
                      {errors.companions?.[index]?.name && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.companions[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`companion-age-${index}`}>Fascia d'età *</Label>
                      <select
                        id={`companion-age-${index}`}
                        {...register(`companions.${index}.ageGroup`)}
                        className={`w-full px-3 py-2 border rounded-md bg-background ${errors.companions?.[index]?.ageGroup ? 'border-destructive' : 'border-border'}`}
                      >
                        <option value="">Seleziona fascia d'età</option>
                        {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      {errors.companions?.[index]?.ageGroup && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.companions[index]?.ageGroup?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Allergeni e intolleranze</h3>
              <p className="text-muted-foreground">Informazioni importanti per il catering</p>
            </div>
            
            <div>
              <Label htmlFor="allergies">Allergeni/intolleranze di {watch("name")}</Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="Es: glutine, lattosio, frutta secca, crostacei..."
                maxLength={200}
                className="min-h-[100px]"
              />
              {errors.allergies && (
                <p className="text-destructive text-sm mt-1">{errors.allergies.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Caratteri rimasti: {200 - (watch("allergies")?.length || 0)}
              </p>
            </div>

            {fields.map((field, index) => (
              <div key={field.id}>
                <Label>Allergeni/intolleranze di {field.name}</Label>
                <Textarea
                  {...register(`companions.${index}.allergies`)}
                  placeholder="Es: glutine, lattosio, frutta secca, crostacei..."
                  maxLength={200}
                  className="min-h-[80px]"
                />
                {errors.companions?.[index]?.allergies && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.companions[index]?.allergies?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 5:
        const formValues = watch();
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Check className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Riepilogo modifiche</h3>
              <p className="text-muted-foreground">Controlla le modifiche prima di salvare</p>
            </div>
            
            <Card className="p-4 bg-muted/30 border-primary/20">
              <div className="space-y-3">
                <div>
                  <strong>Nome:</strong> {formValues.name}
                </div>
                <div>
                  <strong>Fascia d'età:</strong> {formValues.ageGroup ? AGE_GROUP_LABELS[formValues.ageGroup] : 'Non specificata'}
                </div>
                <div>
                  <strong>Categoria:</strong> {CATEGORY_LABELS[formValues.category]}
                </div>
                <div>
                  <strong>Accompagnatori:</strong> {formValues.companionCount}
                  {fields.length > 0 && (
                    <div className="ml-4 text-sm text-muted-foreground space-y-1">
                      {fields.map((field, idx) => (
                        <div key={field.id}>
                          {field.name} ({field.ageGroup ? AGE_GROUP_LABELS[field.ageGroup] : 'Fascia d\'età non specificata'})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formValues.allergies && (
                  <div>
                    <strong>Allergeni {formValues.name}:</strong> {formValues.allergies}
                  </div>
                )}
                {fields.some(field => field.allergies) && (
                  <div>
                    <strong>Allergeni accompagnatori:</strong>
                    <div className="ml-4 text-sm">
                      {fields
                        .filter(field => field.allergies)
                        .map(field => `${field.name}: ${field.allergies}`)
                        .join(', ')
                      }
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="ghost"
        className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:p-2 text-xs text-primary hover:bg-primary/10"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline sm:ml-1">Modifica</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Invitato</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Passo {currentStep} di {totalSteps}</span>
                <Button 
                  onClick={resetForm}
                  variant="ghost" 
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-romantic h-2 rounded-full transition-romantic"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Indietro
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Avanti
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={onSubmit} className="bg-success hover:bg-success/90 text-white">
                  <Check className="w-4 h-4 mr-1" />
                  Salva modifiche
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditGuestForm;
