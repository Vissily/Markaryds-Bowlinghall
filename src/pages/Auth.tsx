import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, validatePasswordStrength } from '@/utils/security';
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

  // Add debug logging
  console.log('Auth component - user:', user);
  console.log('Auth component - loading:', loading);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User is logged in, redirecting to admin...');
      window.location.href = '/admin';
    }
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Client-side validation
      if (!isValidEmail(username)) {
        alert('Ange en giltig e-postadress');
        return;
      }
      
      if (password.length < 6) {
        alert('Lösenordet måste vara minst 6 tecken');
        return;
      }
      
      const result = await signIn(username, password);
      if (result.error) {
        alert('Inloggning misslyckades: ' + result.error.message);
      }
    } catch (error) {
      alert('Ett fel uppstod vid inloggning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Client-side validation
      if (!isValidEmail(username)) {
        alert('Ange en giltig e-postadress');
        return;
      }
      
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        alert(`Lösenordet uppfyller inte kraven:\n${passwordValidation.errors.join('\n')}`);
        return;
      }
      
      const { error } = await signUp(username, password, displayName);
      if (error) {
        alert(`Fel: ${error.message}`);
      } else {
        alert('Registrering lyckades! Kontrollera din e-post för att bekräfta kontot.');
      }
    } catch (err) {
      alert('Ett oväntat fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
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
              Admin-inloggning för Markaryds Bowlinghall
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="signin">Logga in</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-blue-800">
                    🔒 Endast befintliga admin-användare kan logga in
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Kontakta administratören för nya konton
                  </p>
                </div>
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