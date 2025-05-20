import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { AppSidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import ImagePicker from '@/components/ImagePicker';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

const profileFormSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }).optional().or(z.literal('')),
  Numero_whatsapp_Bot: z.string().optional().or(z.literal('')),
  "Numero Whatsapp perso": z.string().optional().or(z.literal('')),
  "Photo de profile": z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Tables<'user_profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nom: '',
      Numero_whatsapp_Bot: '',
      "Numero Whatsapp perso": '',
      "Photo de profile": null,
    },
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
          console.error('Error fetching profile:', error);
          toast({ title: 'Erreur', description: 'Impossible de charger le profil.', variant: 'destructive' });
        } else if (data) {
          setProfile(data);
          form.reset({
            nom: data.nom || '',
            Numero_whatsapp_Bot: data.Numero_whatsapp_Bot ? String(data.Numero_whatsapp_Bot) : '',
            "Numero Whatsapp perso": data["Numero Whatsapp perso"] || '',
            "Photo de profile": data["Photo de profile"],
          });
        }
        setIsLoading(false);
      };
      fetchProfile();
    } else if (!authLoading) {
      setIsLoading(false); // Not logged in, no profile to fetch
    }
  }, [user, authLoading, form, toast]);

  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    setIsUploading(true);
    
    try {
      // Créer un nom de fichier unique avec l'extension du fichier d'origine
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading file:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, 
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({ 
          title: 'Erreur d\'upload', 
          description: uploadError.message, 
          variant: 'destructive' 
        });
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        toast({ 
          title: 'Erreur', 
          description: "Impossible d'obtenir l'URL publique de l'image.", 
          variant: 'destructive'
        });
        return null;
      }
      
      console.log('File uploaded successfully:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast({ 
        title: 'Erreur', 
        description: "Une erreur inattendue s'est produite pendant l'upload.", 
        variant: 'destructive' 
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      toast({ title: 'Erreur', description: 'Utilisateur non authentifié.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    let imageUrl = values["Photo de profile"];

    if (selectedImageFile) {
      const uploadedUrl = await handleImageUpload(selectedImageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        // Don't proceed with DB update if image upload failed but was attempted
        setIsLoading(false);
        return; 
      }
    }

    // Convert string to number for Numero_whatsapp_Bot if it's not empty
    const whatsappBotNumber = values.Numero_whatsapp_Bot ? 
      parseFloat(values.Numero_whatsapp_Bot) || null : 
      null;

    const updateData: TablesUpdate<'user_profiles'> = {
      nom: values.nom,
      Numero_whatsapp_Bot: whatsappBotNumber,
      "Numero Whatsapp perso": values["Numero Whatsapp perso"],
      "Photo de profile": imageUrl,
      // 'Offre' is not included, so it won't be updated.
    };

    // Mise à jour des user_metadata également pour que le nom s'affiche dans la sidebar
    if (values.nom) {
      try {
        await supabase.auth.updateUser({
          data: { nom: values.nom }
        });
      } catch (error) {
        console.error('Error updating user metadata:', error);
      }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id);

    setIsLoading(false);
    setSelectedImageFile(null); // Clear selected file after submission attempt

    if (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil.', variant: 'destructive' });
    } else {
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées.' });
      // Optionally re-fetch profile or update local state if `imageUrl` changed
      if (imageUrl !== profile?.["Photo de profile"]) {
        setProfile(prev => prev ? {...prev, "Photo de profile": imageUrl} : null);
        form.setValue("Photo de profile", imageUrl);
      }
    }
  };

  if (authLoading || (isLoading && user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }
  
  const fallbackName = profile?.nom || user.email?.split('@')[0] || "Utilisateur";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background p-4 sm:p-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Mon Profil</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="Photo de profile"
                      render={({ field }) => (
                        <FormItem>
                           <ImagePicker
                            currentImageUrl={field.value}
                            onImageSelect={handleImageSelect}
                            onImageUpload={handleImageUpload}
                            isUploading={isUploading}
                            fallbackText={fallbackName}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Numero_whatsapp_Bot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro WhatsApp Bot</FormLabel>
                          <FormControl>
                            <Input placeholder="Numéro de votre bot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Numero Whatsapp perso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro WhatsApp Personnel</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre numéro personnel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto">
                      {isLoading || isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Enregistrer les modifications
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;
