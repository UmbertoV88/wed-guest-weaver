import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  User, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Check,
  X
} from "lucide-react";
import { GuestFormData, CATEGORY_LABELS, GuestCategory, Guest, AgeGroup, AGE_GROUP_LABELS } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";

interface AddGuestFormProps {
  addGuest: (formData: GuestFormData) => Promise<Guest>;
}

const AddGuestForm = ({ addGuest }: AddGuestFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    category: '' as GuestCategory,
    companionCount: 0,
    companions: [],
    allergies: '',
    ageGroup: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const totalSteps = 6;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Il nome è obbligatorio';
        } else if (formData.name.trim().length < 2) {
          newErrors.name = 'Il nome deve contenere almeno 2 caratteri';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.name.trim())) {
          newErrors.name = 'Il nome può contenere solo lettere, spazi, apostrofi e trattini';
        }
        break;
      
      case 2:
        if (!formData.category) {
          newErrors.category = 'Seleziona una categoria';
        }
        break;
      
      case 3:
        if (!formData.ageGroup) {
          newErrors.ageGroup = 'Seleziona la fascia d\'età';
        }
        break;
      
      case 4:
        if (formData.companionCount > 0) {
          formData.companions.forEach((companion, index) => {
            if (!companion.name.trim()) {
              newErrors[`companion-${index}`] = 'Il nome dell\'accompagnatore è obbligatorio';
            } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(companion.name.trim())) {
              newErrors[`companion-${index}`] = 'Nome non valido';
            }
            if (!companion.ageGroup) {
              newErrors[`companion-age-${index}`] = 'Seleziona la fascia d\'età dell\'accompagnatore';
            }
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    const companions = Array.from({ length: count }, (_, index) => 
      formData.companions[index] || { name: '', allergies: '', ageGroup: undefined }
    );
    setFormData(prev => ({ ...prev, companionCount: count, companions }));
  };

  const updateCompanion = (index: number, field: 'name' | 'allergies' | 'ageGroup', value: string | AgeGroup) => {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '' as GuestCategory,
      companionCount: 0,
      companions: [],
      allergies: '',
      ageGroup: undefined
    });
    setCurrentStep(1);
    setErrors({});
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (validateStep(5)) {
      try {
        await addGuest(formData);
        toast({
          title: "Invitato aggiunto!",
          description: `${formData.name} è stato aggiunto alla lista degli invitati.`,
        });
        resetForm();
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiunta dell'invitato.",
          variant: "destructive",
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Nome dell'invitato</h3>
              <p className="text-muted-foreground">Chi vuoi invitare al matrimonio?</p>
            </div>
            
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es: Mario Rossi"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name}</p>
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
                  onClick={() => setFormData(prev => ({ ...prev, category: key as GuestCategory }))}
                  className={`p-4 rounded-lg border-2 text-left transition-romantic ${
                    formData.category === key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Fascia d'età</h3>
              <p className="text-muted-foreground">Qual è la fascia d'età di {formData.name}?</p>
            </div>
            
            <div className="grid gap-3">
              {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, ageGroup: key as AgeGroup }))}
                  className={`p-4 rounded-lg border-2 text-left transition-romantic ${
                    formData.ageGroup === key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              {errors.ageGroup && (
                <p className="text-destructive text-sm">{errors.ageGroup}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Accompagnatori</h3>
              <p className="text-muted-foreground">Quante persone accompagneranno {formData.name}?</p>
            </div>
            
            <div>
              <Label htmlFor="companionCount">Numero di accompagnatori</Label>
              <select
                id="companionCount"
                value={formData.companionCount}
                onChange={(e) => updateCompanions(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {formData.companionCount > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Dettagli accompagnatori:</h4>
                {formData.companions.map((companion, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <Label className="text-sm font-medium">Accompagnatore {index + 1}</Label>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Nome completo</Label>
                      <Input
                        value={companion.name}
                        onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                        placeholder="Nome completo"
                        className={errors[`companion-${index}`] ? 'border-destructive' : ''}
                      />
                      {errors[`companion-${index}`] && (
                        <p className="text-destructive text-sm mt-1">{errors[`companion-${index}`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Fascia d'età</Label>
                      <select
                        value={companion.ageGroup || ''}
                        onChange={(e) => updateCompanion(index, 'ageGroup', e.target.value as AgeGroup)}
                        className={`w-full px-3 py-2 border rounded-md bg-background ${
                          errors[`companion-age-${index}`] ? 'border-destructive' : 'border-border'
                        }`}
                      >
                        <option value="">Seleziona fascia d'età</option>
                        {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      {errors[`companion-age-${index}`] && (
                        <p className="text-destructive text-sm mt-1">{errors[`companion-age-${index}`]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Accompagnatori</h3>
              <p className="text-muted-foreground">Quante persone accompagneranno {formData.name}?</p>
            </div>
            
            <div>
              <Label htmlFor="companionCount">Numero di accompagnatori</Label>
              <select
                id="companionCount"
                value={formData.companionCount}
                onChange={(e) => updateCompanions(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {formData.companionCount > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Nome degli accompagnatori:</h4>
                {formData.companions.map((companion, index) => (
                  <div key={index}>
                    <Label>Accompagnatore {index + 1}</Label>
                    <Input
                      value={companion.name}
                      onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                      placeholder="Nome completo"
                      className={errors[`companion-${index}`] ? 'border-destructive' : ''}
                    />
                    {errors[`companion-${index}`] && (
                      <p className="text-destructive text-sm mt-1">{errors[`companion-${index}`]}</p>
                    )}
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
              <Label htmlFor="allergies">Allergeni/intolleranze di {formData.name}</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="Es: glutine, lattosio, frutta secca, crostacei..."
                maxLength={200}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Caratteri rimasti: {200 - (formData.allergies?.length || 0)}
              </p>
            </div>

            {formData.companions.map((companion, index) => (
              <div key={index}>
                <Label>Allergeni/intolleranze di {companion.name}</Label>
                <Textarea
                  value={companion.allergies || ''}
                  onChange={(e) => updateCompanion(index, 'allergies', e.target.value)}
                  placeholder="Es: glutine, lattosio, frutta secca, crostacei..."
                  maxLength={200}
                  className="min-h-[80px]"
                />
              </div>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Check className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Riepilogo invitato</h3>
              <p className="text-muted-foreground">Controlla i dati prima di salvare</p>
            </div>
            
            <Card className="p-4 bg-muted/30 border-primary/20">
              <div className="space-y-3">
                <div>
                  <strong>Nome:</strong> {formData.name}
                </div>
                <div>
                  <strong>Categoria:</strong> {CATEGORY_LABELS[formData.category]}
                </div>
                <div>
                  <strong>Fascia d'età:</strong> {formData.ageGroup ? AGE_GROUP_LABELS[formData.ageGroup] : 'Non specificata'}
                </div>
                <div>
                  <strong>Accompagnatori:</strong> {formData.companionCount}
                  {formData.companions.length > 0 && (
                    <div className="ml-4 text-sm text-muted-foreground space-y-1">
                      {formData.companions.map((comp, index) => (
                        <div key={index}>
                          {comp.name} - {comp.ageGroup ? AGE_GROUP_LABELS[comp.ageGroup] : 'Età non specificata'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.allergies && (
                  <div>
                    <strong>Allergeni {formData.name}:</strong> {formData.allergies}
                  </div>
                )}
                {formData.companions.some(comp => comp.allergies) && (
                  <div>
                    <strong>Allergeni accompagnatori:</strong>
                    <div className="ml-4 text-sm">
                      {formData.companions
                        .filter(comp => comp.allergies)
                        .map(comp => `${comp.name}: ${comp.allergies}`)
                        .join(', ')
                      }
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        size="lg"
        className="bg-hero text-white shadow-elegant hover:shadow-floating transition-romantic"
      >
        <Plus className="w-5 h-5 mr-2" />
        Aggiungi nuovo invitato
      </Button>
    );
  }

  return (
    <Card className="p-6 shadow-elegant border-primary/20 animate-fade-in-up">
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
          <Button onClick={handleSubmit} className="bg-success hover:bg-success/90 text-white">
            <Check className="w-4 h-4 mr-1" />
            Salva invitato
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AddGuestForm;