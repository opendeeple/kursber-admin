import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api, type Provider, type TransferType, type ExchangeRate } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RateFormData {
  provider_id: string;
  transfer_type_id: string;
  rate: string;
  commission_percent: string;
  is_active: boolean;
}

const emptyForm: RateFormData = {
  provider_id: '',
  transfer_type_id: '',
  rate: '',
  commission_percent: '',
  is_active: true,
};

export function RatesPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [transferTypes, setTransferTypes] = useState<TransferType[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [formData, setFormData] = useState<RateFormData>(emptyForm);

  useEffect(() => {
    Promise.all([
      api.providers.list(),
      api.transferTypes.list(),
      api.exchangeRates.all(),
    ])
      .then(([p, t, r]) => {
        setProviders(p.sort((a, b) => a.sort_order - b.sort_order));
        setTransferTypes(t.sort((a, b) => a.sort_order - b.sort_order));
        setRates(r);
      })
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const reloadRates = async () => {
    try {
      const r = await api.exchangeRates.all();
      setRates(r);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const findRate = (providerId: string, transferTypeId: string): ExchangeRate | undefined =>
    rates.find(r => r.provider_id === providerId && r.transfer_type_id === transferTypeId);

  const openCreate = (providerId: string, transferTypeId: string) => {
    setEditingRate(null);
    setFormData({ ...emptyForm, provider_id: providerId, transfer_type_id: transferTypeId });
    setIsDialogOpen(true);
  };

  const openEdit = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setFormData({
      provider_id: rate.provider_id,
      transfer_type_id: rate.transfer_type_id,
      rate: String(rate.rate),
      commission_percent: rate.commission_percent != null ? String(rate.commission_percent) : '',
      is_active: rate.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        provider_id: formData.provider_id,
        transfer_type_id: formData.transfer_type_id,
        rate: parseFloat(formData.rate),
        commission_percent: formData.commission_percent ? parseFloat(formData.commission_percent) : null,
        is_active: formData.is_active,
      };

      if (editingRate) {
        await api.exchangeRates.update(editingRate.id, payload);
        toast.success('Kurs yangilandi');
      } else {
        await api.exchangeRates.create(payload);
        toast.success("Kurs qo'shildi");
      }

      setIsDialogOpen(false);
      setFormData(emptyForm);
      setEditingRate(null);
      await reloadRates();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async (rate: ExchangeRate) => {
    if (!confirm("Bu kursni o'chirmoqchimisiz?")) return;
    try {
      await api.exchangeRates.delete(rate.id);
      toast.success("Kurs o'chirildi");
      await reloadRates();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const toggleRateActive = async (rate: ExchangeRate, is_active: boolean) => {
    try {
      await api.exchangeRates.update(rate.id, { is_active });
      await reloadRates();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const getProviderName = (id: string) =>
    providers.find(p => p.id === id)?.name ?? id;

  const getTransferTypeName = (id: string) =>
    transferTypes.find(t => t.id === id)?.name ?? id;

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Kurs boshqaruvi</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Kurslar matritsasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border px-3 py-2 text-left text-xs font-bold uppercase tracking-wide min-w-[140px]">
                    Provayder
                  </th>
                  {transferTypes.map((tt) => (
                    <th key={tt.id} className="border px-3 py-2 text-center text-xs font-bold uppercase tracking-wide min-w-[160px]">
                      {tt.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-muted/20">
                    <td className="border px-3 py-2 font-bold text-sm">{provider.name}</td>
                    {transferTypes.map((tt) => {
                      const rate = findRate(provider.id, tt.id);
                      return (
                        <td key={tt.id} className="border px-3 py-2 text-center">
                          {rate ? (
                            <div className="space-y-1">
                              <div className="font-black text-base text-primary">{rate.rate}</div>
                              {rate.commission_percent != null && (
                                <div className="text-xs text-muted-foreground">
                                  {rate.commission_percent}% komissiya
                                </div>
                              )}
                              <div className="flex items-center justify-center gap-1">
                                <Switch
                                  checked={rate.is_active}
                                  onCheckedChange={(checked) => toggleRateActive(rate, checked)}
                                />
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => openEdit(rate)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDelete(rate)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => openCreate(provider.id, tt.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) { setFormData(emptyForm); setEditingRate(null); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Kursni tahrirlash' : "Kurs qo'shish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Provayder</div>
                <div className="font-bold text-sm">{getProviderName(formData.provider_id)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">O'tkazma turi</div>
                <div className="font-bold text-sm">{getTransferTypeName(formData.transfer_type_id)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kurs</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Komissiya (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commission_percent}
                  onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <span className="text-sm font-medium">Faol</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit">Saqlash</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
