import { useEffect, useState } from 'react';
import { exchangeRatesApi, transferTypesApi, type ExchangeRate, type TransferType } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export function RatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [transferTypes, setTransferTypes] = useState<TransferType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ratesData, typesData] = await Promise.all([
        exchangeRatesApi.getAll(),
        transferTypesApi.getAll(),
      ]);
      setRates(ratesData);
      setTransferTypes(typesData.slice().sort((a, b) => a.sort_order - b.sort_order));
      setEdits({});
    } catch (error) {
      console.error('Failed to load rates:', error);
      toast.error('Kurslarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // keep alias so save handler can still call it
  const loadRates = loadData;

  const handleRateChange = (id: string, value: number) => {
    setEdits((prev) => ({ ...prev, [id]: value }));
  };

  const saveAllRates = async () => {
    const changed = Object.entries(edits);
    if (changed.length === 0) {
      toast.info('O\'zgarishlar yo\'q');
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        changed.map(([id, rate]) => exchangeRatesApi.update(id, { rate }))
      );
      toast.success('Barcha kurslar saqlandi!');
      loadRates();
    } catch (error) {
      console.error('Error saving rates:', error);
      toast.error('Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  // Build groups keyed by transfer type ID, using the sorted transferTypes list as the source of truth
  const ratesByType = rates.reduce<Record<string, ExchangeRate[]>>((acc, rate) => {
    const key = rate.transfer_type.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rate);
    return acc;
  }, {});

  // Only show transfer types that have at least one rate
  const groups = transferTypes
    .filter(tt => (ratesByType[tt.id]?.length ?? 0) > 0)
    .map(tt => ({ id: tt.id, name: tt.name, rates: ratesByType[tt.id] }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kurs boshqaruvi</h1>
        </div>
        <Button onClick={saveAllRates} disabled={saving || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>

      {/* First two groups side by side */}
      {groups.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.slice(0, 2).map((group) => (
            <RateGroupCard
              key={group.id}
              title={group.name}
              rates={group.rates}
              edits={edits}
              onRateChange={handleRateChange}
            />
          ))}
        </div>
      )}

      {/* Third+ groups at half width */}
      {groups.slice(2).length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.slice(2).map((group) => (
            <RateGroupCard
              key={group.id}
              title={group.name}
              rates={group.rates}
              edits={edits}
              onRateChange={handleRateChange}
            />
          ))}
        </div>
      )}

      {groups.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            Kurslar topilmadi
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RateGroupCard({
  title,
  rates,
  edits,
  onRateChange,
}: {
  title: string;
  rates: ExchangeRate[];
  edits: Record<string, number>;
  onRateChange: (id: string, value: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title} kurslari</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Ilova
                </th>
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Kurs
                </th>
                <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">
                  O'zgartirish
                </th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, i) => {
                const currentValue = edits[rate.id] !== undefined ? edits[rate.id] : rate.rate;
                const isEdited = edits[rate.id] !== undefined;
                return (
                  <tr key={rate.id} className={i < rates.length - 1 ? 'border-b' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
                          {rate.provider.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm">{rate.provider.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-black text-green-600">{rate.rate.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.1"
                        value={currentValue}
                        onChange={(e) => onRateChange(rate.id, parseFloat(e.target.value) || 0)}
                        className={`border rounded-lg px-2.5 py-1.5 text-sm font-bold w-24 outline-none transition-colors ${
                          isEdited
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : 'border-border focus:border-primary'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
