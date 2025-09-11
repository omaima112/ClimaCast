import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type FavoriteCity, type InsertFavoriteCity } from "@shared/schema";

export function useFavorites() {
  const { toast } = useToast();
  
  const favoritesQuery = useQuery({
    queryKey: ["/api/favorites"],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (cityData: InsertFavoriteCity) => {
      const response = await apiRequest("POST", "/api/favorites", cityData);
      return response.json();
    },
    onSuccess: (data: FavoriteCity) => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
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
      const response = await apiRequest("DELETE", `/api/favorites/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
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