import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, API_BASE_URL, type Provider } from '@/lib/api';
import { Plus, Pencil, Trash2, Star, ShieldCheck, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function getAvatarColor(name: string): string {
  const colors = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#3b82f6', '#a855f7'];
  return colors[name.length % colors.length];
}

const emptyForm = {
  name: '',
  slug: '',
  is_active: true,
  is_trusted: false,
  is_featured: false,
  sort_order: 0,
  link: '',
};

export function AppsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await api.providers.list();
      setProviders(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingProvider ? prev.slug : toSlug(name),
    }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setIconFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setIconPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasExistingIcon = editingProvider?.icon_url != null;
    if (!iconFile && !hasExistingIcon) {
      toast.error('Ikonka majburiy');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        is_active: formData.is_active,
        is_trusted: formData.is_trusted,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
        link: formData.link || null,
        icon_url: null,
      };

      let savedId: string;
      if (editingProvider) {
        await api.providers.update(editingProvider.id, payload);
        savedId = editingProvider.id;
        toast.success('Provayder yangilandi');
      } else {
        const created = await api.providers.create(payload);
        savedId = created.id;
        toast.success("Provayder qo'shildi");
      }

      if (iconFile) {
        await api.providers.uploadIcon(savedId, iconFile);
      }

      setIsDialogOpen(false);
      resetForm();
      loadProviders();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      slug: provider.slug,
      is_active: provider.is_active,
      is_trusted: provider.is_trusted,
      is_featured: provider.is_featured,
      sort_order: provider.sort_order,
      link: provider.link ?? '',
    });
    setIconFile(null);
    setIconPreview(provider.icon_url ?? null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu provaydarni o'chirmoqchimisiz?")) return;
    try {
      await api.providers.delete(id);
      toast.success("Provayder o'chirildi");
      loadProviders();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const toggleActive = async (provider: Provider, is_active: boolean) => {
    try {
      await api.providers.update(provider.id, { is_active });
      toast.success(is_active ? 'Provayder yoqildi' : "Provayder o'chirildi");
      loadProviders();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProvider(null);
    setIconFile(null);
    setIconPreview(null);
  };

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Provayderlar boshqaruvi</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Provayder qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProvider ? 'Provaydarni tahrirlash' : "Provayder qo'shish"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ikonka <span className="text-destructive">*</span>
                </label>
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="hidden"
                />
                <div
                  onClick={() => iconInputRef.current?.click()}
                  className="group relative mx-auto flex h-28 w-28 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/60"
                >
                  {iconPreview ? (
                    <>
                      <img
                        src={iconPreview.startsWith('blob:') ? iconPreview : `${API_BASE_URL}${iconPreview}`}
                        alt="icon preview"
                        className="h-full w-full rounded-2xl object-cover"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="h-5 w-5 text-white" />
                        <span className="text-xs font-medium text-white">O'zgartirish</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs font-medium">Yuklash</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nomi</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tartib raqami</label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link (URL)</label>
                  <Input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_trusted}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_trusted: checked })}
                  />
                  <span className="text-sm font-medium">Ishonchli provayder</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <span className="text-sm font-medium">Tanlangan provayder (featured)</span>
                </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Barcha provayderlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Provayder</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Belgilar</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Holat</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {provider.icon_url ? (
                          <img
                            src={`${API_BASE_URL}${provider.icon_url}`}
                            alt={provider.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-sm"
                            style={{ backgroundColor: getAvatarColor(provider.name) }}
                          >
                            {provider.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold">{provider.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm font-mono">{provider.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {provider.is_trusted && (
                          <Badge variant="secondary">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Ishonchli
                          </Badge>
                        )}
                        {provider.is_featured && (
                          <Badge variant="secondary">
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={(checked) => toggleActive(provider, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(provider)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(provider.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
