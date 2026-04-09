import { useEffect, useState } from 'react';
import { adminApi, type Settings } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    default_amount: 1000,
    show_card_tab: true,
    show_visa_tab: true,
    show_cash_tab: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setSettings({
        default_amount: data.default_amount ?? 1000,
        show_card_tab: data.show_card_tab ?? true,
        show_visa_tab: data.show_visa_tab ?? true,
        show_cash_tab: data.show_cash_tab ?? true,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Sozlamalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);

    try {
      await adminApi.updateSettings(settings);
      toast.success('Sozlamalar saqlandi');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
          <p className="text-muted-foreground mt-2">
            Ilova sozlamalarini boshqarish
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Standart miqdor</CardTitle>
            <CardDescription>
              Ilova ochilganda ko'rsatiladigan standart miqdor (UZS)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="defaultAmount" className="text-sm font-medium">
                Miqdor (UZS)
              </label>
              <Input
                id="defaultAmount"
                type="number"
                value={settings.default_amount}
                onChange={(e) =>
                  setSettings({ ...settings, default_amount: parseInt(e.target.value) || 1000 })
                }
                placeholder="1000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tab sozlamalari</CardTitle>
            <CardDescription>
              Ilovada qaysi tablarni ko'rsatishni tanlang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Kartaga tab</div>
                <div className="text-sm text-muted-foreground">
                  Kartaga o'tkazmalar tabini ko'rsatish
                </div>
              </div>
              <Switch
                checked={settings.show_card_tab}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, show_card_tab: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">VISA tab</div>
                <div className="text-sm text-muted-foreground">
                  VISA kartalar tabini ko'rsatish
                </div>
              </div>
              <Switch
                checked={settings.show_visa_tab}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, show_visa_tab: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Naqd tab</div>
                <div className="text-sm text-muted-foreground">
                  Naqd pul tabini ko'rsatish
                </div>
              </div>
              <Switch
                checked={settings.show_cash_tab}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, show_cash_tab: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ma'lumotlar</CardTitle>
          <CardDescription>
            Joriy sozlamalar haqida ma'lumot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Standart miqdor</div>
              <div className="text-2xl font-bold mt-1">
                {settings.default_amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">UZS</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Faol tablar</div>
              <div className="text-2xl font-bold mt-1">
                {[settings.show_card_tab, settings.show_visa_tab, settings.show_cash_tab].filter(Boolean).length}
                <span className="text-sm font-normal text-muted-foreground"> / 3</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-2xl font-bold mt-1 text-green-600">Faol</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
