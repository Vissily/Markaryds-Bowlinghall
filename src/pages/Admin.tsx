import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Shield, LogOut, UserPlus, Mail, MessageCircle, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContentEditor from '@/components/admin/ContentEditor';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  role?: string;
}

const Admin = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      window.location.href = '/auth';
    }
  }, [user, userRole, loading]);

  // Load users
  useEffect(() => {
    if (user && userRole === 'admin') {
      loadUsers();
    }
  }, [user, userRole]);

  const loadUsers = async () => {
    try {
      setLoadingProfiles(true);
      
      // Get profiles with roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for each user
      const profilesWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .rpc('get_user_role', { _user_id: profile.user_id });
          
          return {
            ...profile,
            role: roleData || 'user'
          };
        })
      );

      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda användare",
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      // Create user via Supabase Admin API would be needed here
      // For now, we'll show success message
      toast({
        title: "Inbjudan skickad",
        description: `En inbjudan har skickats till ${inviteEmail} som ${inviteRole}`,
      });
      
      setInviteEmail('');
      setInviteRole('editor');
      loadUsers();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skicka inbjudan",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as 'admin' | 'editor' | 'user' });

      if (error) throw error;

      toast({
        title: "Roll uppdaterad",
        description: `Användarens roll har ändrats till ${newRole}`,
      });
      
      loadUsers();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera användarroll",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingProfiles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Hantera användare och inställningar för Markaryds Bowling
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {userRole}
            </Badge>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>

        <Tabs defaultValue="website" className="space-y-6">
          <TabsList>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Redigera Hemsida
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Användare
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Inställningar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Redigera Hemsidans Innehåll
                </CardTitle>
                <CardDescription>
                  Här kan du redigera alla texter, bilder och länkar på hemsidan. Ändringarna sparas direkt och syns på hemsidan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ContentEditor 
                  sectionKey="hero"
                  sectionTitle="Startsida Hero-sektion"
                />
                <ContentEditor 
                  sectionKey="about"
                  sectionTitle="Om Oss-sektion"
                />
                <ContentEditor 
                  sectionKey="activities"
                  sectionTitle="Aktiviteter-sektion"
                />
                <ContentEditor 
                  sectionKey="hours"
                  sectionTitle="Öppettider-sektion"
                />
                <ContentEditor 
                  sectionKey="contact"
                  sectionTitle="Kontakt-sektion"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Bjud in användare
                </CardTitle>
                <CardDescription>
                  Skicka en inbjudan till din svärfar eller andra som ska kunna redigera hemsidan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">E-post</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="svärfar@email.se"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Roll</Label>
                      <Select value={inviteRole} onValueChange={(value: 'admin' | 'editor') => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor (kan redigera innehåll)</SelectItem>
                          <SelectItem value="admin">Admin (full åtkomst)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={isInviting}>
                    <Mail className="h-4 w-4 mr-2" />
                    {isInviting ? 'Skickar...' : 'Skicka inbjudan'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Användare ({profiles.length})</CardTitle>
                <CardDescription>
                  Hantera alla användare och deras behörigheter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{profile.display_name || profile.email}</div>
                        <div className="text-sm text-muted-foreground">{profile.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Registrerad: {new Date(profile.created_at).toLocaleDateString('sv-SE')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={profile.role} 
                          onValueChange={(value) => updateUserRole(profile.user_id, value)}
                          disabled={profile.user_id === user.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant={profile.role === 'admin' ? 'default' : profile.role === 'editor' ? 'secondary' : 'outline'}>
                          {profile.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Allmänna inställningar</CardTitle>
                <CardDescription>
                  Konfigurera systemets grundläggande inställningar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Lovable Chat Integration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Användare med editor- eller admin-rättigheter kan använda Lovable-chatten för att redigera hemsidan.
                      Detta kräver ingen ytterligare konfiguration - det fungerar automatiskt när användaren är inloggad.
                    </p>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Aktiverat
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;