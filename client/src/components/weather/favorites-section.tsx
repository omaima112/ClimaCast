import { useFavorites } from "@/hooks/use-favorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash2, MapPin } from "lucide-react";
import { type FavoriteCity } from "@/types/schema";

interface FavoritesSectionProps {
  onCitySelect: (city: FavoriteCity) => void;
}

export function FavoritesSection({ onCitySelect }: FavoritesSectionProps) {
  const { favorites, isLoading, removeFavorite, isRemovingFavorite } = useFavorites();

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5 text-orange-400" />
            Favorite Cities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5 text-orange-400" />
            Favorite Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/60">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No favorite cities yet</p>
            <p className="text-sm">Add cities to your favorites for quick access</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-orange-400" />
          Favorite Cities ({favorites.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favorites.map((city) => (
          <div
            key={city.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            data-testid={`card-favorite-${city.id}`}
          >
            <button
              onClick={() => onCitySelect(city)}
              className="flex items-center gap-3 flex-1 text-left group"
              data-testid={`button-favorite-${city.id}`}
            >
              <MapPin className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <div>
                <div className="font-medium text-white group-hover:text-orange-200 transition-colors">
                  {city.name}
                </div>
                <div className="text-sm text-white/60">
                  {city.country}
                </div>
              </div>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFavorite(city.id)}
              disabled={isRemovingFavorite}
              className="text-white/60 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
              data-testid={`button-remove-favorite-${city.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}