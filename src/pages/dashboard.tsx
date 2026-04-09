import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, type AdminStats } from '@/lib/api';

const CHART_COLORS = [
  '#5b4fcf', '#22c55e', '#3b82f6', '#e8231a', '#f5c518',
  '#dc2626', '#16a34a', '#7c3aed', '#0891b2', '#db2777',
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());
  const [clicksView, setClicksView] = useState<'apps' | 'tabs'>('apps');

  useEffect(() => {
    loadStats(date);
  }, [date]);

  const loadStats = async (d: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getStats(d);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-9 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const maxProviderCount = Math.max(...(stats?.clicks_by_provider.map(p => p.count) ?? [1]), 1);
  const maxTabCount = Math.max(...(stats?.clicks_by_transfer_type.map(t => t.count) ?? [1]), 1);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total users */}
        <Card className="relative overflow-hidden border-t-4 border-t-green-500">
          <CardContent className="pt-5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Jami User
            </div>
            <div className="text-4xl font-black">
              {stats?.total_users.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>

        {/* Active users with date filter */}
        <Card className="relative overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Active user
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="text-4xl font-black">
              {loading ? <Skeleton className="h-9 w-20" /> : (stats?.active_users.count.toLocaleString() ?? 0)}
            </div>
          </CardContent>
        </Card>

        {/* Daily clicks with date filter */}
        <Card className="relative overflow-hidden border-t-4 border-t-red-500">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Kunlik bosishlar
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground outline-none focus:border-primary"
              />
            </div>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <>
                <div className="text-4xl font-black">{stats?.daily_clicks.total.toLocaleString() ?? 0}</div>
                <div className="text-xs font-bold text-muted-foreground mt-1">
                  Unique: <span>{stats?.daily_clicks.unique.toLocaleString() ?? 0}</span> foydalanuvchi
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* App clicks chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Ilova bosishlari</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border rounded-lg px-2 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setClicksView('apps')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${clicksView === 'apps' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  >
                    Ilovalar
                  </button>
                  <button
                    onClick={() => setClicksView('tabs')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${clicksView === 'tabs' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  >
                    Tablar
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-2.5 flex-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            ) : clicksView === 'apps' ? (
              <div className="space-y-3">
                {(stats?.clicks_by_provider ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Ma'lumot yo'q</p>
                ) : (
                  stats?.clicks_by_provider.map((item, i) => (
                    <div key={item.provider_id} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-16 text-right flex-shrink-0 truncate">
                        {item.provider_name}
                      </span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / maxProviderCount) * 100}%`,
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs font-black w-14" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.clicks_by_transfer_type ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Ma'lumot yo'q</p>
                ) : (
                  stats?.clicks_by_transfer_type.map((item, i) => (
                    <div key={item.transfer_type_id} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-16 text-right flex-shrink-0 truncate">
                        {item.transfer_type_name}
                      </span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / maxTabCount) * 100}%`,
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs font-black w-14" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New users with date filter */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Yangi foydalanuvchilar</CardTitle>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg px-2 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
            {loading ? (
              <Skeleton className="h-16 w-24" />
            ) : (
              <>
                <div className="text-6xl font-black text-green-500 leading-none">
                  {stats?.new_users.count ?? 0}
                </div>
                <div className="text-sm font-bold text-muted-foreground">
                  {date === today() ? 'Bugun' : date}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
