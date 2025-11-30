import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Guest, CATEGORY_LABELS, AGE_GROUP_LABELS } from "@/types/guest";

import { guestFormSchema, GuestFormInput } from "@/schemas/guestSchema";
import { useTranslation } from "react-i18next";

interface AddGuestFormProps {
  addGuest: (formData: GuestFormInput) => Promise<Guest>;
}

const AddGuestForm = ({ addGuest }: AddGuestFormProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [attemptedNext, setAttemptedNext] = useState(false);

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
    setAttemptedNext(true);
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setAttemptedNext(false);
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
    reset();
    setCurrentStep(1);
    setIsOpen(false);
    setAttemptedNext(false);
  };

  const onSubmit = handleSubmit(async (data: GuestFormInput) => {
    try {
      await addGuest(data);
      resetForm();
    } catch (error) {
      console.error('Add guest error:', error);
    }
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">{t('guests.form.step1.title')}</h3>
              <p className="text-muted-foreground">{t('guests.form.step1.subtitle')}</p>
            </div>

            <div>
              <Label htmlFor="name">{t('guests.form.nameLabel')}</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t('guests.form.namePlaceholder')}
                className={errors.name || (attemptedNext && !watch("name")?.trim()) ? 'border-destructive' : ''}
              />
              {(errors.name || (attemptedNext && !watch("name")?.trim())) && (
                <p className="text-destructive text-sm mt-1">
                  {errors.name?.message || t('guests.form.errors.nameRequired')}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ageGroup">{t('guests.form.ageGroupLabel')}</Label>
              <select
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => setValue("ageGroup", e.target.value as "Adulto" | "Ragazzo" | "Bambino")}
                className={`w-full px-3 py-2 border rounded-md bg-background ${errors.ageGroup ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">{t('guests.form.ageGroupPlaceholder')}</option>
                {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{t(`guests.ageGroups.${key === 'Adulto' ? 'adult' : key === 'Ragazzo' ? 'teen' : key === 'Bambino' ? 'child' : 'baby'}`)}</option>
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
              <h3 className="text-xl font-semibold">{t('guests.form.step2.title')}</h3>
              <p className="text-muted-foreground">{t('guests.form.step2.subtitle')}</p>
            </div>

            <div className="grid gap-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue("category", key as "family-his" | "family-hers" | "friends" | "colleagues")}
                  className={`p-4 rounded-lg border-2 text-left transition-romantic ${category === key
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <span className="font-medium">{t(`guests.categories.${key}`)}</span>
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
              <h3 className="text-xl font-semibold">{t('guests.form.step3.title')}</h3>
              <p className="text-muted-foreground">{t('guests.form.step3.subtitle', { name: watch("name") })}</p>
            </div>

            <div>
              <Label htmlFor="companionCount">{t('guests.form.companionCountLabel')}</Label>
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
              {errors.companionCount && (
                <p className="text-destructive text-sm mt-1">{errors.companionCount.message}</p>
              )}
            </div>

            {companionCount > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">{t('guests.form.companionsDetailsLabel')}</h4>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 p-3 border rounded-lg">
                    <Label className="text-sm font-medium">{t('guests.form.companionLabel', { index: index + 1 })}</Label>
                    <div>
                      <Label htmlFor={`companion-name-${index}`}>{t('guests.form.nameLabel')}</Label>
                      <Input
                        id={`companion-name-${index}`}
                        {...register(`companions.${index}.name`)}
                        placeholder={t('guests.form.namePlaceholder')}
                        className={errors.companions?.[index]?.name ? 'border-destructive' : ''}
                      />
                      {errors.companions?.[index]?.name && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.companions[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`companion-age-${index}`}>{t('guests.form.ageGroupLabel')}</Label>
                      <select
                        id={`companion-age-${index}`}
                        {...register(`companions.${index}.ageGroup`)}
                        className={`w-full px-3 py-2 border rounded-md bg-background ${errors.companions?.[index]?.ageGroup ? 'border-destructive' : 'border-border'}`}
                      >
                        <option value="">{t('guests.form.ageGroupPlaceholder')}</option>
                        {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{t(`guests.ageGroups.${key === 'Adulto' ? 'adult' : key === 'Ragazzo' ? 'teen' : key === 'Bambino' ? 'child' : 'baby'}`)}</option>
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
              <h3 className="text-xl font-semibold">{t('guests.form.step4.title')}</h3>
              <p className="text-muted-foreground">{t('guests.form.step4.subtitle')}</p>
            </div>

            <div>
              <Label htmlFor="allergies">{t('guests.form.allergiesLabel', { name: watch("name") })}</Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder={t('guests.form.allergiesPlaceholder')}
                maxLength={200}
                className="min-h-[100px]"
              />
              {errors.allergies && (
                <p className="text-destructive text-sm mt-1">{errors.allergies.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t('guests.form.charsRemaining', { count: 200 - (watch("allergies")?.length || 0) })}
              </p>
            </div>

            {fields.map((field, index) => (
              <div key={field.id}>
                <Label>{t('guests.form.allergiesLabel', { name: field.name })}</Label>
                <Textarea
                  {...register(`companions.${index}.allergies`)}
                  placeholder={t('guests.form.allergiesPlaceholder')}
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

      case 5: {
        const formValues = watch();
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Check className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-xl font-semibold">{t('guests.form.step5.title')}</h3>
              <p className="text-muted-foreground">{t('guests.form.step5.subtitle')}</p>
            </div>

            <Card className="p-4 bg-muted/30 border-primary/20">
              <div className="space-y-3">
                <div>
                  <strong>{t('guests.form.summary.name')}</strong> {formValues.name}
                </div>
                <div>
                  <strong>{t('guests.form.summary.ageGroup')}</strong> {formValues.ageGroup ? t(`guests.ageGroups.${formValues.ageGroup === 'Adulto' ? 'adult' : formValues.ageGroup === 'Ragazzo' ? 'teen' : formValues.ageGroup === 'Bambino' ? 'child' : 'baby'}`) : t('guests.form.notSpecified')}
                </div>
                <div>
                  <strong>{t('guests.form.summary.category')}</strong> {t(`guests.categories.${formValues.category}`)}
                </div>
                <div>
                  <strong>{t('guests.form.summary.companions')}</strong> {formValues.companionCount}
                  {fields.length > 0 && (
                    <div className="ml-4 text-sm text-muted-foreground space-y-1">
                      {fields.map((field, idx) => (
                        <div key={field.id}>
                          {field.name} ({field.ageGroup ? t(`guests.ageGroups.${field.ageGroup === 'Adulto' ? 'adult' : field.ageGroup === 'Ragazzo' ? 'teen' : field.ageGroup === 'Bambino' ? 'child' : 'baby'}`) : t('guests.form.notSpecified')})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formValues.allergies && (
                  <div>
                    <strong>{t('guests.form.summary.allergies', { name: formValues.name })}</strong> {formValues.allergies}
                  </div>
                )}
                {fields.some(field => field.allergies) && (
                  <div>
                    <strong>{t('guests.form.summary.companionAllergies')}</strong>
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
      }
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
        {t('guests.form.buttons.add')}
      </Button>
    );
  }

  return (
    <Card className="p-6 shadow-elegant border-primary/20 animate-fade-in-up min-w-[460px] w-full max-w-[30rem] mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{t('guests.form.steps', { current: currentStep, total: totalSteps })}</span>
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
      <div className="mb-6 min-h-[280px]">
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
          {t('common.actions.back')}
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={nextStep}>
            {t('common.actions.next')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={onSubmit} className="bg-success hover:bg-success/90 text-white">
            <Check className="w-4 h-4 mr-1" />
            {t('guests.form.buttons.save')}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AddGuestForm;
