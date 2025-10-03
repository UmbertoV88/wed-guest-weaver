import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useBudgetQuery } from '@/hooks/useBudgetQuery';
import { z } from 'zod';

const vendorSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Il nome deve avere almeno 2 caratteri')
    .max(100, 'Il nome deve avere massimo 100 caratteri'),
  category_id: z.string()
    .min(1, 'Seleziona una categoria'),
  default_cost: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Inserisci un costo valido maggiore di 0'
    })
    .refine((val) => parseFloat(val) <= 100000, {
      message: 'Il costo sembra eccessivo (max €100.000)'
    }),
  contact_email: z.string()
    .trim()
    .email('Formato email non valido')
    .max(255, 'Email troppo lunga')
    .optional()
    .or(z.literal('')),
  contact_phone: z.string()
    .trim()
    .max(50, 'Numero di telefono troppo lungo')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .trim()
    .max(255, 'URL troppo lungo')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .max(500, 'Indirizzo troppo lungo')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .trim()
    .max(1000, 'Note troppo lunghe (max 1000 caratteri)')
    .optional()
    .or(z.literal('')),
  payment_due_date: z.date().optional()
});

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  preselectedCategoryId?: string;
}

const AddVendorDialog: React.FC<AddVendorDialogProps> = ({
  open,
  onOpenChange,
  categories,
  preselectedCategoryId
}) => {
  const { addVendor } = useBudgetQuery();
  
  // Normalizza URL aggiungendo https:// se manca il protocollo
  const normalizeUrl = (url: string): string => {
    if (!url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    category_id: preselectedCategoryId || '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    notes: '',
    default_cost: '',
    payment_due_date: undefined as Date | undefined
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aggiorna category_id quando cambia preselectedCategoryId
  useEffect(() => {
    if (preselectedCategoryId) {
      setFormData(prev => ({ ...prev, category_id: preselectedCategoryId }));
    }
  }, [preselectedCategoryId]);

  // Reset form quando il dialog si chiude
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        category_id: preselectedCategoryId || '',
        contact_email: '',
        contact_phone: '',
        address: '',
        website: '',
        notes: '',
        default_cost: '',
        payment_due_date: undefined
      });
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [open, preselectedCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errori precedenti
    setFormErrors({});
    
    // Validazione con zod
    const result = vendorSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cost = parseFloat(formData.default_cost);
      const vendorData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: normalizeUrl(formData.website) || undefined,
        notes: formData.notes.trim() || undefined,
        default_cost: cost,
        payment_due_date: formData.payment_due_date ? format(formData.payment_due_date, 'yyyy-MM-dd') : undefined
      };

      await addVendor(vendorData);
      
      // Chiudi il dialog solo dopo il successo
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante l\'aggiunta del fornitore:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sconosciuta';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Pulisci l'errore quando l'utente inizia a digitare
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Aggiungi Nuovo Fornitore
          </DialogTitle>
          <DialogDescription>
            {preselectedCategoryId && (
              <span className="text-sm">
                Categoria: <span className="font-semibold">{getCategoryName(preselectedCategoryId)}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Fornitore */}
            <div>
              <Label htmlFor="vendor-name">Nome Fornitore *</Label>
              <Input
                id="vendor-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="es. Studio Fotografico Luce"
                className={formErrors.name ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <Label>Categoria *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleInputChange('category_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={formErrors.category_id ? 'border-red-500 focus:border-red-500' : ''}>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category_id && (
                <p className="text-sm text-red-500 mt-1">{formErrors.category_id}</p>
              )}
            </div>

            {/* Costo */}
            <div>
              <Label htmlFor="vendor-cost">Costo *</Label>
              <Input
                id="vendor-cost"
                type="number"
                value={formData.default_cost}
                onChange={(e) => handleInputChange('default_cost', e.target.value)}
                placeholder="1000.00"
                step="0.01"
                min="0.01"
                className={formErrors.default_cost ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.default_cost && (
                <p className="text-sm text-red-500 mt-1">{formErrors.default_cost}</p>
              )}
            </div>

            {/* Data Scadenza */}
            <div>
              <Label>Data Scadenza</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.payment_due_date && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.payment_due_date ? (
                      format(formData.payment_due_date, "PPP", { locale: it })
                    ) : (
                      <span>Seleziona data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.payment_due_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, payment_due_date: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">Opzionale: data entro cui pagare il fornitore</p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="vendor-email">Email</Label>
              <Input
                id="vendor-email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="email@example.com"
                className={formErrors.contact_email ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.contact_email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.contact_email}</p>
              )}
            </div>

            {/* Telefono */}
            <div>
              <Label htmlFor="vendor-phone">Telefono</Label>
              <Input
                id="vendor-phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+39 333 123 4567"
                className={formErrors.contact_phone ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.contact_phone && (
                <p className="text-sm text-red-500 mt-1">{formErrors.contact_phone}</p>
              )}
            </div>

            {/* Sito Web */}
            <div>
              <Label htmlFor="vendor-website">Sito Web</Label>
              <Input
                id="vendor-website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="example.com"
                className={formErrors.website ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.website && (
                <p className="text-sm text-red-500 mt-1">{formErrors.website}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">https:// verrà aggiunto automaticamente</p>
            </div>
          </div>

          {/* Indirizzo */}
          <div>
            <Label htmlFor="vendor-address">Indirizzo</Label>
            <Input
              id="vendor-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Via Roma 123, Milano"
              className={formErrors.address ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isSubmitting}
            />
            {formErrors.address && (
              <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="vendor-notes">Note</Label>
            <Textarea
              id="vendor-notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Note aggiuntive..."
              rows={3}
              className={formErrors.notes ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isSubmitting}
            />
            {formErrors.notes && (
              <p className="text-sm text-red-500 mt-1">{formErrors.notes}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvataggio...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Fornitore
                </>
              )}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Annulla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVendorDialog;
