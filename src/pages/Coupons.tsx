
import { useState } from 'react';
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Bookmark, Calendar, Clock, Image, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImagePicker from "@/components/ImagePicker";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Coupon {
  id: number;
  title: string;
  description: string;
  image_url: string;
  date_utilisation: string;
  heure_utilisation: string;
  created_at: string;
}

const Coupons = () => {
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    title: '',
    description: '',
    image_url: '',
    date_utilisation: '',
    heure_utilisation: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: coupons, isLoading, refetch } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data as Coupon[];
    }
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `coupons/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      return;
    }
    
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    setNewCoupon({
      ...newCoupon,
      image_url: urlData.publicUrl
    });
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.title || !newCoupon.image_url || !newCoupon.date_utilisation || !newCoupon.heure_utilisation) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const { error } = await supabase
      .from('coupons')
      .insert([newCoupon]);
    
    if (error) {
      console.error('Error adding coupon:', error);
      return;
    }
    
    setNewCoupon({
      title: '',
      description: '',
      image_url: '',
      date_utilisation: '',
      heure_utilisation: ''
    });
    setIsAddingCoupon(false);
    refetch();
  };

  const filteredCoupons = coupons?.filter(coupon => 
    coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const iconColors = ["pink", "teal", "blue", "orange", "purple", "amber"] as const;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-4 sm:p-6">
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                  <Button 
                    onClick={() => setIsAddingCoupon(!isAddingCoupon)} 
                    className="rounded-full"
                  >
                    {isAddingCoupon ? 'Annuler' : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un coupon
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Gérez les coupons disponibles pour vos clients
                </p>
              </div>

              {isAddingCoupon ? (
                <div className="mb-8">
                  <DashboardCard
                    title="Nouveau coupon"
                    icon={<Bookmark />}
                    iconColor="blue"
                  >
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Image du coupon</label>
                        <div className="flex items-center gap-4">
                          {newCoupon.image_url ? (
                            <div className="relative w-32 h-32">
                              <img 
                                src={newCoupon.image_url} 
                                alt="Aperçu" 
                                className="w-32 h-32 object-cover rounded-lg border" 
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                                onClick={() => setNewCoupon({...newCoupon, image_url: ''})}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                              <ImagePicker onImageSelected={handleImageUpload}>
                                <div className="flex flex-col items-center cursor-pointer">
                                  <Image className="h-8 w-8 mb-1" />
                                  <span className="text-xs">Ajouter</span>
                                </div>
                              </ImagePicker>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              Ajoutez une image de votre coupon pour que les clients puissent le visualiser.
                              Format recommandé: JPG ou PNG, 800x600px minimum.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Titre</label>
                          <Input 
                            value={newCoupon.title} 
                            onChange={(e) => setNewCoupon({...newCoupon, title: e.target.value})}
                            placeholder="Titre du coupon"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Input 
                            value={newCoupon.description} 
                            onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                            placeholder="Description du coupon"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Date d'utilisation</label>
                          <div className="relative">
                            <Input 
                              type="date"
                              value={newCoupon.date_utilisation} 
                              onChange={(e) => setNewCoupon({...newCoupon, date_utilisation: e.target.value})}
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Heure d'utilisation</label>
                          <div className="relative">
                            <Input 
                              type="time"
                              value={newCoupon.heure_utilisation} 
                              onChange={(e) => setNewCoupon({...newCoupon, heure_utilisation: e.target.value})}
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsAddingCoupon(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddCoupon}>
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher un coupon..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
                    <button className="filter-pill active">Tous</button>
                    <button className="filter-pill">Actifs</button>
                    <button className="filter-pill">Expirés</button>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-60 rounded-xl border bg-muted animate-pulse" />
                      ))
                    ) : filteredCoupons?.length ? (
                      filteredCoupons.map((coupon, index) => (
                        <DashboardCard
                          key={coupon.id}
                          title={coupon.title}
                          icon={<Bookmark />}
                          iconColor={iconColors[index % iconColors.length]}
                          footer={
                            <div className="w-full flex justify-between items-center">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(coupon.date_utilisation), 'dd MMM yyyy', { locale: fr })}
                                <Clock className="h-3 w-3 ml-3 mr-1" />
                                {coupon.heure_utilisation}
                              </div>
                              <Button variant="ghost" size="sm">Modifier</Button>
                            </div>
                          }
                        >
                          <div className="flex flex-col space-y-4">
                            {coupon.image_url && (
                              <div className="relative w-full h-36 rounded-lg overflow-hidden">
                                <img 
                                  src={coupon.image_url} 
                                  alt={coupon.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <p className="text-sm text-muted-foreground">
                              {coupon.description}
                            </p>
                          </div>
                        </DashboardCard>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">
                          {searchTerm ? 'Aucun coupon ne correspond à votre recherche' : 'Aucun coupon disponible'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Coupons;
