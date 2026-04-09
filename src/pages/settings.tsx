import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface LocalSettings {
  defaultAmount: number;
  showCardTab: boolean;
  showVisaTab: boolean;
  showCashTab: boolean;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<LocalSettings>({
    defaultAmount: 1000,
    showCardTab: true,
    showVisaTab: true,
    showCashTab: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.settings.get()
      .then((data) => {
        setSettings({
          defaultAmount: data.default_amount,
          showCardTab: data.show_card_tab,
          showVisaTab: data.show_visa_tab,
          showCashTab: data.show_cash_tab,
        });
      })
      .catch((error) => console.error('Error loading settings:', error))
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.admin.updateSettings({
        default_amount: settings.defaultAmount,
        show_card_tab: settings.showCardTab,
        show_visa_tab: settings.showVisaTab,
        show_cash_tab: settings.showCashTab,
      });
      toast.success('Sozlamalar saqlandi');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sozlamalar</h2>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Ilova sozlamalari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Default summa</div>
                <p className="text-sm text-muted-foreground">
                  Bosh sahifada ko'rsatiladigan summa
                </p>
              </div>
              <Input
                type="number"
                value={settings.defaultAmount}
                onChange={(e) => setSettings({ ...settings, defaultAmount: parseInt(e.target.value) || 1000 })}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Kartaga tab</div>
                <p className="text-sm text-muted-foreground">
                  Kartaga tabini ko'rsatish
                </p>
              </div>
              <Switch
                checked={settings.showCardTab}
                onCheckedChange={(checked) => setSettings({ ...settings, showCardTab: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">VISA tab</div>
                <p className="text-sm text-muted-foreground">
                  VISA tabini ko'rsatish
                </p>
              </div>
              <Switch
                checked={settings.showVisaTab}
                onCheckedChange={(checked) => setSettings({ ...settings, showVisaTab: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Naqd tab</div>
                <p className="text-sm text-muted-foreground">
                  Naqd tabini ko'rsatish
                </p>
              </div>
              <Switch
                checked={settings.showCashTab}
                onCheckedChange={(checked) => setSettings({ ...settings, showCashTab: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
