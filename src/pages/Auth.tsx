import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CircleDot, Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(username, password);
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signUp(username, password, displayName);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-muted/20 bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CircleDot className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">Markaryds Bowling</span>
            </div>
            <CardTitle>Välkommen</CardTitle>
            <CardDescription>
              Skapa först ett admin-konto, sedan kan du redigera hemsidan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Skapa konto</TabsTrigger>
                <TabsTrigger value="signin">Logga in</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-primary">
                    🎯 Första steget: Skapa ett admin-konto
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Använd din email-adress som användarnamn
                  </p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email (blir ditt användarnamn)
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin@markaryds.se"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Lösenord
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Välj ett lösenord"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Ditt namn
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Admin Användare"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Skapar konto...' : 'Skapa admin-konto'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signin-username"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="din@email.se"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Lösenord
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ditt lösenord"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Loggar in...' : 'Logga in'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                ← Tillbaka till hemsidan
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;