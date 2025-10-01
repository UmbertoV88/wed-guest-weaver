import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, X } from 'lucide-react';
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
    .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: 'Il sito deve iniziare con http:// o https://'
    })
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
    .or(z.literal(''))
});

interface EditVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  vendor: any | null;
}

const EditVendorDialog: React.FC<EditVendorDialogProps> = ({
  open,
  onOpenChange,
  categories,
  vendor
}) => {
  const { updateVendor } = useBudgetQuery();
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    notes: '',
    default_cost: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popola il form quando cambia vendor
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        category_id: vendor.category_id || '',
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        address: vendor.address || '',
        website: vendor.website || '',
        notes: vendor.notes || '',
        default_cost: vendor.default_cost?.toString() || ''
      });
    }
  }, [vendor]);

  // Reset form quando il dialog si chiude
  useEffect(() => {
    if (!open) {
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendor) return;
    
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
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        address: formData.address.trim() || null,
        website: formData.website.trim() || null,
        notes: formData.notes.trim() || null,
        default_cost: cost
      };

      await updateVendor(vendor.id, vendorData);
      
      // Chiudi il dialog solo dopo il successo
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante la modifica del fornitore:', error);
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

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Modifica Fornitore
          </DialogTitle>
          <DialogDescription>
            Categoria: <span className="font-semibold">{getCategoryName(formData.category_id)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Fornitore */}
            <div>
              <Label htmlFor="edit-vendor-name">Nome Fornitore *</Label>
              <Input
                id="edit-vendor-name"
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
              <Label htmlFor="edit-vendor-cost">Costo *</Label>
              <Input
                id="edit-vendor-cost"
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

            {/* Email */}
            <div>
              <Label htmlFor="edit-vendor-email">Email</Label>
              <Input
                id="edit-vendor-email"
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
              <Label htmlFor="edit-vendor-phone">Telefono</Label>
              <Input
                id="edit-vendor-phone"
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
              <Label htmlFor="edit-vendor-website">Sito Web</Label>
              <Input
                id="edit-vendor-website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className={formErrors.website ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.website && (
                <p className="text-sm text-red-500 mt-1">{formErrors.website}</p>
              )}
            </div>
          </div>

          {/* Indirizzo */}
          <div>
            <Label htmlFor="edit-vendor-address">Indirizzo</Label>
            <Input
              id="edit-vendor-address"
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
            <Label htmlFor="edit-vendor-notes">Note</Label>
            <Textarea
              id="edit-vendor-notes"
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvataggio...
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Salva Modifiche
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

export default EditVendorDialog;
