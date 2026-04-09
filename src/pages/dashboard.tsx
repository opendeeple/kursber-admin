import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api, type AdminStats } from '@/lib/api';
import { Users, Activity, MousePointerClick } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  dailyClicks: number;
  uniqueClickers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

function mapStats(data: AdminStats): Stats {
  return {
    totalUsers: data.total_users,
    activeUsers: data.active_users,
    dailyClicks: data.daily_clicks,
    uniqueClickers: data.unique_clickers,
    newUsersToday: data.new_users_today,
    newUsersThisWeek: data.new_users_this_week,
    newUsersThisMonth: data.new_users_this_month,
  };
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    dailyClicks: 0,
    uniqueClickers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats()
      .then((data) => setStats(mapStats(data)))
      .catch((error) => console.error('Error loading dashboard data:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Jami User
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Active user
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.activeUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Kunlik bosishlar
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.dailyClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique: {stats.uniqueClickers.toLocaleString()} foydalanuvchi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Yangi foydalanuvchilar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bugun</p>
              <p className="text-2xl font-bold">{stats.newUsersToday}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bu hafta</p>
              <p className="text-2xl font-bold">{stats.newUsersThisWeek}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bu oy</p>
              <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
