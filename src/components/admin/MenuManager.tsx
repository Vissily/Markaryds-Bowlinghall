import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  sort_order: number;
  available: boolean;
}

const MenuManager = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setCategories(categoriesRes.data || []);
      setItems(itemsRes.data || []);
    } catch (error) {
      console.error('Error loading menu data:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda menydata",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      toast({
        title: "Fel",
        description: "Fyll i alla obligatoriska fält",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('menu_items').insert({
        name: newItem.name,
        description: newItem.description || null,
        price: parseFloat(newItem.price),
        category_id: newItem.category_id,
        available: newItem.available,
        sort_order: items.length
      });

      if (error) throw error;

      setNewItem({ name: '', description: '', price: '', category_id: '', available: true });
      setShowAddDialog(false);
      loadData();
      
      toast({
        title: "Tillagt!",
        description: "Menyrätten har lagts till",
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: "Fel",
        description: "Kunde inte lägga till menyrätt",
        variant: "destructive",
      });
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          available: item.available
        })
        .eq('id', item.id);

      if (error) throw error;

      setEditingItem(null);
      loadData();
      
      toast({
        title: "Uppdaterat!",
        description: "Menyrätten har uppdaterats",
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera menyrätt",
        variant: "destructive",
      });
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna menyrätt?')) return;

    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);

      if (error) throw error;

      loadData();
      
      toast({
        title: "Borttaget!",
        description: "Menyrätten har tagits bort",
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort menyrätt",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Okänd kategori';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Laddar meny...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Menyhantering</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Lägg till rätt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lägg till ny menyrätt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={newItem.category_id} onValueChange={(value) => 
                    setNewItem({...newItem, category_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Rättens namn"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beskrivning</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Beskrivning av rätten"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Pris (kr)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={addMenuItem}>
                    Lägg till
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = items.filter(item => item.category_id === category.id);
            
            return (
              <div key={category.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">{category.name}</h3>
                
                {categoryItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Inga rätter i denna kategori</p>
                ) : (
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded bg-background">
                        {editingItem?.id === item.id ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                            <Input
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                              placeholder="Namn"
                            />
                            <Input
                              value={editingItem.description || ''}
                              onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                              placeholder="Beskrivning"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={editingItem.price}
                              onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                              placeholder="Pris"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateMenuItem(editingItem)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.name}</h4>
                                <span className="font-semibold text-primary">{item.price} kr</span>
                                {!item.available && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    Ej tillgänglig
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteMenuItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuManager;