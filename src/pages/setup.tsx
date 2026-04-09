import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck as CheckCircle2 } from 'lucide-react';

export function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Setup tugallangan</CardTitle>
          <CardDescription>
            Admin panel allaqachon sozlangan. Login sahifasiga o'ting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            Login sahifasiga o'tish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
