import { useEffect, useState } from 'react';
import { adminApi, type User } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, searchDebounced, date, limit]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        page,
        limit,
        search: searchDebounced || undefined,
        date: date || undefined,
      });
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#3b82f6', '#a855f7'];
  const getAvatarColor = (name: string) => AVATAR_COLORS[name.length % AVATAR_COLORS.length];

  const formatLastActive = (iso?: string) => {
    if (!iso) return '—';
    try {
      return format(new Date(iso), 'dd.MM.yyyy HH:mm');
    } catch {
      return '—';
    }
  };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
    setPage(1);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setPage(1);
  };

  // Pagination page buttons
  const renderPageButtons = () => {
    const maxBtns = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxBtns - 1);
    if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);
    const btns = [];
    for (let i = start; i <= end; i++) {
      btns.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          disabled={loading}
          className={`w-8 h-8 rounded-lg border text-sm font-bold transition-all ${
            i === page
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border hover:bg-muted'
          }`}
        >
          {i}
        </button>
      );
    }
    return btns;
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Foydalanuvchilar</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-52"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-0 px-0">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Foydalanuvchi</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Ro'yxatdan o'tgan</TableHead>
                  <TableHead className="pr-6">So'nggi faollik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Foydalanuvchilar topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: getAvatarColor(user.full_name) }}
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <span className="font-bold">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{user.phone}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(user.created_at), 'dd.MM.yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm pr-6">
                        {formatLastActive(user.last_active_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between px-6 py-3 border-t flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">Sahifada:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm font-bold outline-none focus:border-primary bg-background"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm font-bold text-muted-foreground">
                {from}–{to} / {total} ta
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {renderPageButtons()}
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
