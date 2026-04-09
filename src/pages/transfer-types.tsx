import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, type TransferType } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const emptyForm = {
  name: '',
  slug: '',
  is_active: true,
  sort_order: 0,
};

export function TransferTypesPage() {
  const [transferTypes, setTransferTypes] = useState<TransferType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TransferType | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadTransferTypes();
  }, []);

  const loadTransferTypes = async () => {
    try {
      const data = await api.transferTypes.list();
      setTransferTypes(data);
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
      slug: editingType ? prev.slug : toSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };

      if (editingType) {
        await api.transferTypes.update(editingType.id, payload);
        toast.success("O'tkazma turi yangilandi");
      } else {
        await api.transferTypes.create(payload);
        toast.success("O'tkazma turi qo'shildi");
      }

      setIsDialogOpen(false);
      resetForm();
      loadTransferTypes();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleEdit = (type: TransferType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      slug: type.slug,
      is_active: type.is_active,
      sort_order: type.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu o'tkazma turini o'chirmoqchimisiz?")) return;
    try {
      await api.transferTypes.delete(id);
      toast.success("O'tkazma turi o'chirildi");
      loadTransferTypes();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const toggleActive = async (type: TransferType, is_active: boolean) => {
    try {
      await api.transferTypes.update(type.id, { is_active });
      toast.success(is_active ? "Yoqildi" : "O'chirildi");
      loadTransferTypes();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingType(null);
  };

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">O'tkazma turlari boshqaruvi</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              O'tkazma turi qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingType ? "O'tkazma turini tahrirlash" : "O'tkazma turi qo'shish"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Tartib raqami</label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-32"
                />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Barcha o'tkazma turlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Nomi</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Tartib</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Holat</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {transferTypes.map((type) => (
                  <tr key={type.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-bold">{type.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm font-mono">{type.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{type.sort_order}</td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={type.is_active}
                        onCheckedChange={(checked) => toggleActive(type, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
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
