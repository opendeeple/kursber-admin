import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { ThemeProvider } from './components/theme-provider';
import { LoginPage } from './pages/login';
import { SetupPage } from './pages/setup';
import { DashboardPage } from './pages/dashboard';
import { AppsPage } from './pages/apps';
import { RatesPage } from './pages/rates';
import { UsersPage } from './pages/users';
import { SettingsPage } from './pages/settings';
import { TransferTypesPage } from './pages/transfer-types';
import { DashboardLayout } from './components/dashboard-layout';
import { Toaster } from './components/ui/sonner';

function Router() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-lg font-semibold">Yuklanmoqda...</div>
      </div>
    );
  }

  if (currentPath === '/setup') {
    return <SetupPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const getPageTitle = () => {
    switch (currentPath) {
      case '/':
        return 'Dashboard';
      case '/apps':
        return 'Provayderlar';
      case '/transfer-types':
        return "O'tkazma turlari";
      case '/rates':
        return 'Kurslar';
      case '/users':
        return 'Foydalanuvchilar';
      case '/settings':
        return 'Sozlamalar';
      default:
        return 'Dashboard';
    }
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <DashboardPage />;
      case '/apps':
        return <AppsPage />;
      case '/transfer-types':
        return <TransferTypesPage />;
      case '/rates':
        return <RatesPage />;
      case '/users':
        return <UsersPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <DashboardLayout title={getPageTitle()} currentPath={currentPath}>
      {renderPage()}
    </DashboardLayout>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="kursber-admin-theme">
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
