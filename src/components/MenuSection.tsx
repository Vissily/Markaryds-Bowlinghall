import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Wine, Coffee, Star } from "lucide-react";

interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  sort_order: number;
  available: boolean;
}

const MenuSection = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          supabase.from('menu_categories').select('*').order('sort_order'),
          supabase.from('menu_items').select('*').eq('available', true).order('sort_order')
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (itemsResponse.error) throw itemsResponse.error;

        setCategories(categoriesResponse.data || []);
        setMenuItems(itemsResponse.data || []);
      } catch (error) {
        console.error('Error loading menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  const getItemsForCategory = (categoryId: string) => {
    return menuItems.filter(item => item.category_id === categoryId);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('barn')) return Star;
    if (name.includes('dessert')) return Coffee;
    if (name.includes('alkohol')) return Wine;
    return ChefHat;
  };

  const getCategoryGradient = (categoryName: string, index: number) => {
    const gradients = [
      "from-orange-500 to-red-500",
      "from-green-500 to-emerald-500", 
      "from-yellow-500 to-orange-500",
      "from-pink-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-indigo-500"
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Laddar meny...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {categories.map((category, categoryIndex) => {
        const items = getItemsForCategory(category.id);
        if (items.length === 0) return null;
        
        const IconComponent = getCategoryIcon(category.name);
        const gradient = getCategoryGradient(category.name, categoryIndex);
        
        return (
          <Card key={category.id} className="overflow-hidden shadow-elegant border-0">
            <CardHeader className={`bg-gradient-to-r ${gradient} text-white px-4 py-4 sm:px-6 sm:py-6`}>
              <CardTitle className="text-xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="grid gap-4 sm:gap-6">
                {items.map((item) => (
                  <div key={item.id} className="relative group pb-4">
                    <div className="flex justify-between items-start gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 sm:gap-3 mb-1">
                          <h3 className="font-bold text-base sm:text-xl text-foreground break-words">{item.name}</h3>
                        </div>
                        {item.description && (
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg sm:text-2xl font-bold text-foreground">{item.price}</span>
                        <span className="text-sm sm:text-base text-muted-foreground ml-1">kr</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MenuSection;