import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { useAuth } from '@/lib/auth-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  currentPath: string;
}

export function DashboardLayout({ children, title, currentPath }: DashboardLayoutProps) {
  const { user } = useAuth();
  const initials = user?.username?.charAt(0).toUpperCase() || 'A';

  return (
    <SidebarProvider>
      <AppSidebar currentPath={currentPath} />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">Admin</span>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">{initials}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
