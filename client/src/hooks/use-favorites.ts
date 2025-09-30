import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type FavoriteCity, type InsertFavoriteCity } from "@/types/schema";

export function useFavorites() {
  const { toast } = useToast();
  
  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const raw = localStorage.getItem("favorites");
      return raw ? (JSON.parse(raw) as FavoriteCity[]) : [];
    },
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (cityData: InsertFavoriteCity) => {
      const newCity: FavoriteCity = {
        id: crypto.randomUUID(),
        name: cityData.name,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        city: cityData.city,
        country: cityData.country,
      };
      const current: FavoriteCity[] = (favoritesQuery.data as FavoriteCity[]) || [];
      const next = [...current, newCity];
      localStorage.setItem("favorites", JSON.stringify(next));
      return newCity;
    },
    onSuccess: (data: FavoriteCity) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: "City added to favorites",
        description: `${data.name} has been added to your favorites.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add favorite",
        description: error.message || "Something went wrong while adding the city to favorites.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      const current: FavoriteCity[] = (favoritesQuery.data as FavoriteCity[]) || [];
      const next = current.filter((c) => c.id !== id);
      localStorage.setItem("favorites", JSON.stringify(next));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: "City removed",
        description: "The city has been removed from your favorites.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove favorite",
        description: error.message || "Something went wrong while removing the city.",
        variant: "destructive",
      });
    },
  });

  const getFavoriteByCoordinates = (latitude: number, longitude: number): FavoriteCity | null => {
    if (!favoritesQuery.data) return null;
    
    return (favoritesQuery.data as FavoriteCity[]).find(
      (city: FavoriteCity) =>
        Math.abs(city.latitude - latitude) < 0.01 &&
        Math.abs(city.longitude - longitude) < 0.01
    ) || null;
  };

  const isFavorite = (latitude: number, longitude: number): boolean => {
    return !!getFavoriteByCoordinates(latitude, longitude);
  };

  return {
    favorites: (favoritesQuery.data as FavoriteCity[]) || [],
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
    getFavoriteByCoordinates,
    isFavorite,
  };
}