import { useEffect, useRef, useState } from 'react';
import { exchangeRatesApi, providersApi, transferTypesApi, API_BASE_URL, type ExchangeRate, type TransferType } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Star, ExternalLink, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AppFormData {
  name: string;
  transfer_type_id: string;
  rate: number;
  commission_percent: number;
  link: string;
  is_featured: boolean;
  is_active: boolean;
}

const DEFAULT_FORM: AppFormData = {
  name: '',
  transfer_type_id: '',
  rate: 0,
  commission_percent: 0,
  link: '',
  is_featured: false,
  is_active: true,
};

export function AppsPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [transferTypes, setTransferTypes] = useState<TransferType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [providers, setProviders] = useState<import('@/lib/api').Provider[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [formData, setFormData] = useState<AppFormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ratesData, typesData, providersData] = await Promise.all([
        exchangeRatesApi.getAll(),
        transferTypesApi.getAll(),
        providersApi.getAll(),
      ]);
      setRates(ratesData);
      setTransferTypes(typesData);
      setProviders(providersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setIconFile(file);
    if (file) setIconPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.transfer_type_id || formData.rate <= 0) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    setSubmitting(true);
    try {
      let providerId: string;

      if (editingRate) {
        await Promise.all([
          providersApi.update(editingRate.provider.id, {
            name: formData.name.trim(),
            link: formData.link.trim() || undefined,
            is_featured: formData.is_featured,
          }),
          exchangeRatesApi.update(editingRate.id, {
            transfer_type_id: formData.transfer_type_id,
            rate: formData.rate,
            commission_percent: formData.commission_percent || undefined,
            is_active: formData.is_active,
          }),
        ]);
        providerId = editingRate.provider.id;
        toast.success('Ilova yangilandi');
      } else {
        // Reuse existing provider if name matches, otherwise create a new one
        const existing = providers.find(
          (p) => p.name.toLowerCase() === formData.name.trim().toLowerCase()
        );
        if (existing) {
          providerId = existing.id;
        } else {
          const slug = formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const newProvider = await providersApi.create({
            name: formData.name.trim(),
            slug,
            link: formData.link.trim() || '',
            is_featured: formData.is_featured,
            is_active: formData.is_active,
          });
          providerId = newProvider.id;
        }
        // Create exchange rate for this provider + tab
        await exchangeRatesApi.create({
          provider_id: providerId,
          transfer_type_id: formData.transfer_type_id,
          rate: formData.rate,
          commission_percent: formData.commission_percent || undefined,
          is_active: formData.is_active,
        });
        toast.success('Ilova qo\'shildi');
      }

      if (iconFile) {
        await providersApi.uploadIcon(providerId, iconFile);
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const openAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.provider.name,
      transfer_type_id: rate.transfer_type.id,
      rate: rate.rate,
      commission_percent: rate.commission_percent || 0,
      link: rate.provider.link || '',
      is_featured: rate.provider.is_featured,
      is_active: rate.is_active,
    });
    setIconFile(null);
    setIconPreview(rate.provider.icon_url ?? null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ilovani o\'chirmoqchimisiz?')) return;
    try {
      await exchangeRatesApi.delete(id);
      toast.success('Ilova o\'chirildi');
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('O\'chirishda xatolik');
    }
  };

  const toggleActive = async (rate: ExchangeRate) => {
    try {
      await exchangeRatesApi.update(rate.id, { is_active: !rate.is_active });
      toast.success(rate.is_active ? 'Ilova o\'chirildi' : 'Ilova yoqildi');
      loadData();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setEditingRate(null);
    setIconFile(null);
    setIconPreview(null);
  };

  const uniqueTransferTypes = Array.from(
    new Map(rates.map(r => [r.transfer_type.id, r.transfer_type])).values()
  );

  const filteredRates = activeTab === 'all'
    ? rates
    : rates.filter(r => r.transfer_type.id === activeTab);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ilovalar boshqaruvi</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ilova qo'shish
        </Button>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Ilovani tahrirlash' : 'Ilova qo\'shish'}</DialogTitle>
            <DialogDescription>
              {editingRate ? 'Ilova ma\'lumotlarini yangilang' : 'Yangi ilova va kurs qo\'shing'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Icon upload */}
            <div className="flex justify-center">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
              <div
                onClick={() => iconInputRef.current?.click()}
                className="group relative h-24 w-24 cursor-pointer rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/60"
              >
                {iconPreview ? (
                  <>
                    <img
                      src={iconPreview.startsWith('blob:') ? iconPreview : `${API_BASE_URL}${iconPreview}`}
                      alt="icon"
                      className="h-full w-full rounded-2xl object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="h-5 w-5 text-white" />
                      <span className="text-xs font-medium text-white">O'zgartirish</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ImageIcon className="h-7 w-7" />
                    <span className="text-xs font-medium">Ikonka</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Ilova nomi
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tezda"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Tab
                </label>
                <Select
                  value={formData.transfer_type_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, transfer_type_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tab tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Kurs (UZS/RUB)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="148"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Komissiya (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commission_percent || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_percent: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Link (URL)
              </label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://app.example.com"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <span className="text-sm font-bold">Foydali ilova (featured)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-base font-bold">Barcha ilovalar</span>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                Barchasi
              </button>
              {uniqueTransferTypes.map((tt) => (
                <button
                  key={tt.id}
                  onClick={() => setActiveTab(tt.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tt.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  {tt.name}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ilova</TableHead>
                  <TableHead>Tab</TableHead>
                  <TableHead>Kurs (UZS/RUB)</TableHead>
                  <TableHead>Komissiya</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Ilovalar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {rate.provider.icon_url ? (
                            <img
                              src={`${API_BASE_URL}${rate.provider.icon_url}`}
                              alt={rate.provider.name}
                              className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                              {rate.provider.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold">{rate.provider.name}</div>
                            {rate.provider.is_featured && (
                              <Badge variant="secondary" className="text-xs mt-0.5">
                                <Star className="mr-1 h-2.5 w-2.5" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rate.transfer_type.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-base font-black">{rate.rate.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {rate.commission_percent ? `${rate.commission_percent}%` : '—'}
                      </TableCell>
                      <TableCell>
                        {rate.provider.link ? (
                          <a
                            href={rate.provider.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 font-bold text-xs hover:underline max-w-[140px] truncate"
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            {rate.provider.link.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rate.is_active}
                          onCheckedChange={() => toggleActive(rate)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(rate)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(rate.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
