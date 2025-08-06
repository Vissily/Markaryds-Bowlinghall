import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const PriceList = () => {
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useSEO({
    title: "Prislista - Markaryds Bowlinghall | Priser Bowling, Padel & Minigolf",
    description: "Se våra aktuella priser för bowling, padel, minigolf och övriga aktiviteter på Markaryds Bowlinghall. Transparent prissättning för familjer och grupper i Markaryd.",
    keywords: "prislista, priser, bowling, padel, minigolf, dart, shuffleboard, markaryd, bowlinghall, timdebitering, aktiviteter",
    canonical: "https://markarydsbowling.se/prislista"
  });

  useEffect(() => {
    fetchPriceItems();
    fetchPriceListPDF();
  }, []);

  const fetchPriceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('price_items')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPriceItems(data || []);
    } catch (error) {
      console.error('Error fetching price items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceListPDF = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('file_path')
        .eq('title', 'Prislista')
        .eq('mime_type', 'application/pdf')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const { data: urlData } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(data.file_path);
        
        setPdfUrl(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  const groupedItems = priceItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PriceItem[]>);

  // Sort items within each category - members first, then non-members
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      const aIsMember = a.name.toLowerCase().includes('medlem') && !a.name.toLowerCase().includes('ej medlem');
      const bIsMember = b.name.toLowerCase().includes('medlem') && !b.name.toLowerCase().includes('ej medlem');
      const aIsNonMember = a.name.toLowerCase().includes('ej medlem');
      const bIsNonMember = b.name.toLowerCase().includes('ej medlem');
      
      // Members first
      if (aIsMember && !bIsMember) return -1;
      if (!aIsMember && bIsMember) return 1;
      
      // Then non-members
      if (aIsNonMember && !bIsNonMember && !bIsMember) return -1;
      if (!aIsNonMember && bIsNonMember && !aIsMember) return 1;
      
      // If same type, sort by sort_order
      return a.sort_order - b.sort_order;
    });
  });

  // Sort categories with specific order: bowling first, then övriga ej medlemmar, then timdebitering, then rest
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const aBowling = a.toLowerCase().includes('bowling');
    const bBowling = b.toLowerCase().includes('bowling');
    const aOvrigaEjMedlem = a.toLowerCase().includes('övriga ej medlemmar');
    const bOvrigaEjMedlem = b.toLowerCase().includes('övriga ej medlemmar');
    const aTimdebitering = a.toLowerCase().includes('timdebitering');
    const bTimdebitering = b.toLowerCase().includes('timdebitering');
    
    // Priority order: 1. Bowling, 2. Övriga ej medlemmar, 3. Timdebitering, 4. Rest
    const getPriority = (category: string) => {
      if (category.toLowerCase().includes('bowling')) return 1;
      if (category.toLowerCase().includes('övriga ej medlemmar')) return 2;
      if (category.toLowerCase().includes('timdebitering')) return 3;
      return 4;
    };
    
    const aPriority = getPriority(a);
    const bPriority = getPriority(b);
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Button
                  variant="outline"
                  asChild
                  className="mr-4"
                >
                  <a href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tillbaka
                  </a>
                </Button>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Prislista
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground mb-8">
                Aktuella priser för alla våra aktiviteter
              </p>

              {pdfUrl && (
                <Button asChild>
                  <a href={pdfUrl} download="Prislista_Markaryds_Bowlinghall.pdf">
                    <Download className="w-4 h-4 mr-2" />
                    Ladda ner PDF
                  </a>
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p>Laddar prislista...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedCategories.map((category) => (
                  <Card key={category} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-2xl text-center">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {groupedItems[category].map((item) => (
                          <div key={item.id} className="flex justify-between items-start p-4 border-b last:border-b-0">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              {item.description && (
                                <p className="text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-primary">
                                {item.price} {item.currency}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {Object.keys(groupedItems).length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <p className="text-muted-foreground">Inga priser tillgängliga för tillfället.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Additional info */}
            <Card className="mt-8 bg-accent/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Observera</h3>
                  <p className="text-sm text-muted-foreground">
                    Priserna kan ändras utan föregående meddelande. 
                    För gruppbokningar och specialerbjudanden, kontakta oss direkt.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <a href="/#kontakt">Kontakta oss</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PriceList;