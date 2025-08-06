import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Save, X, Plus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PriceItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

const PriceManager = () => {
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    category: '',
    name: '',
    description: '',
    price: 0,
    currency: 'SEK',
    is_active: true,
    sort_order: 0
  });
  const { toast } = useToast();

  const categories = ['Bowling', 'Padel', 'Minigolf', 'Dart', 'Shuffleboard', 'Mat & Dryck', 'Övrigt'];

  useEffect(() => {
    fetchPriceItems();
  }, []);

  const fetchPriceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('price_items')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPriceItems(data || []);
    } catch (error) {
      console.error('Error fetching price items:', error);
      toast({
        title: "Fel vid hämtning",
        description: "Kunde inte ladda prislistan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: PriceItem) => {
    try {
      const { error } = await supabase
        .from('price_items')
        .update({
          category: item.category,
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency,
          is_active: item.is_active,
          sort_order: item.sort_order
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Prissatt uppdaterad",
        description: "Ändringarna har sparats"
      });

      setEditingItem(null);
      fetchPriceItems();
    } catch (error) {
      console.error('Error updating price item:', error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte spara ändringarna",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna prissatt?')) return;

    try {
      const { error } = await supabase
        .from('price_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Prissatt borttagen",
        description: "Prissatten har tagits bort"
      });

      fetchPriceItems();
    } catch (error) {
      console.error('Error deleting price item:', error);
      toast({
        title: "Fel vid borttagning",
        description: "Kunde inte ta bort prissatten",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.name || newItem.price <= 0) {
      toast({
        title: "Fyll i alla fält",
        description: "Kategori, namn och pris krävs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('price_items')
        .insert([newItem]);

      if (error) throw error;

      toast({
        title: "Prissatt tillagd",
        description: "Den nya prissatten har lagts till"
      });

      setNewItem({
        category: '',
        name: '',
        description: '',
        price: 0,
        currency: 'SEK',
        is_active: true,
        sort_order: 0
      });
      setIsAdding(false);
      fetchPriceItems();
    } catch (error) {
      console.error('Error adding price item:', error);
      toast({
        title: "Fel vid tillägg",
        description: "Kunde inte lägga till prissatten",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_items')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentActive ? "Prissatt dold" : "Prissatt synlig",
        description: currentActive ? "Prissatten är nu dold från prislistan" : "Prissatten visas nu i prislistan"
      });

      fetchPriceItems();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast({
        title: "Fel vid uppdatering",
        description: "Kunde inte ändra synlighet",
        variant: "destructive"
      });
    }
  };

  const groupedItems = priceItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PriceItem[]>);

  if (loading) {
    return <div>Laddar prislista...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Hantera prislista
            <Button 
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
            >
              <Plus className="w-4 h-4 mr-2" />
              Lägg till prissatt
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <Card className="mb-6 p-4 border-2 border-dashed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Kategori</label>
                  <Select 
                    value={newItem.category} 
                    onValueChange={(value) => setNewItem({...newItem, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Namn</label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Produktnamn"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pris (SEK)</label>
                  <Input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sorteringsordning</label>
                  <Input
                    type="number"
                    value={newItem.sort_order}
                    onChange={(e) => setNewItem({...newItem, sort_order: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium">Beskrivning (valfri)</label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Beskrivning av produkten..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem}>
                  <Save className="w-4 h-4 mr-2" />
                  Spara
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Avbryt
                </Button>
              </div>
            </Card>
          )}

          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">{category}</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {editingItem === item.id ? (
                        <>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const updated = priceItems.map(p => 
                                p.id === item.id ? {...p, name: e.target.value} : p
                              );
                              setPriceItems(updated);
                            }}
                          />
                          <Input
                            value={item.description || ''}
                            onChange={(e) => {
                              const updated = priceItems.map(p => 
                                p.id === item.id ? {...p, description: e.target.value} : p
                              );
                              setPriceItems(updated);
                            }}
                            placeholder="Beskrivning"
                          />
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = priceItems.map(p => 
                                p.id === item.id ? {...p, price: parseFloat(e.target.value) || 0} : p
                              );
                              setPriceItems(updated);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{item.price} {item.currency}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.is_active ? "default" : "secondary"}>
                              {item.is_active ? "Synlig" : "Dold"}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {editingItem === item.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(item)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingItem(null);
                              fetchPriceItems();
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleActive(item.id, item.is_active)}
                          >
                            {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingItem(item.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceManager;