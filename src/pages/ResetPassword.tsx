import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength } from '@/utils/security';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleDot, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      setMessage(`Lösenordet uppfyller inte kraven:\n${validation.errors.join('\n')}`);
      return;
    }
    if (password !== confirm) {
      setMessage('Lösenorden matchar inte');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      setMessage('Kunde inte uppdatera lösenordet: ' + error.message);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-muted/20 bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CircleDot className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">Markaryds Bowling</span>
            </div>
            <CardTitle>Välj nytt lösenord</CardTitle>
            <CardDescription>
              {done
                ? 'Ditt lösenord är uppdaterat'
                : ready
                ? 'Ange ett nytt lösenord för ditt konto'
                : 'Öppna länken från återställningsmailet för att fortsätta'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {done ? (
              <Button className="w-full" asChild>
                <Link to="/auth">Till inloggningen</Link>
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Nytt lösenord
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nytt lösenord"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Bekräfta lösenord
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Upprepa lösenordet"
                    required
                  />
                </div>
                {message && (
                  <p className="text-sm text-destructive whitespace-pre-line">{message}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting || !ready}>
                  {isSubmitting ? 'Sparar...' : 'Spara nytt lösenord'}
                </Button>
              </form>
            )}
            <div className="text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
                ← Tillbaka till inloggningen
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
