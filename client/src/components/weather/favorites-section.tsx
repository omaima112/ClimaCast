import { useFavorites } from "@/hooks/use-favorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash2, MapPin } from "lucide-react";
import { type FavoriteCity } from "@shared/schema";

interface FavoritesSectionProps {
  onCitySelect: (city: FavoriteCity) => void;
}

export function FavoritesSection({ onCitySelect }: FavoritesSectionProps) {
  const { favorites, isLoading, removeFavorite, isRemovingFavorite } = useFavorites();

  if (isLoading) {
    return (
      <Card className="bg-card/90 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-yellow-400" />
            Favorite Cities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="bg-card/90 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-yellow-400" />
            Favorite Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No favorite cities yet</p>
            <p className="text-sm">Add cities to your favorites for quick access</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Star className="w-5 h-5 text-yellow-400" />
          Favorite Cities ({favorites.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {favorites.map((city) => (
          <div
            key={city.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/70 transition-colors"
          >
            <button
              onClick={() => onCitySelect(city)}
              className="flex items-center gap-3 flex-1 text-left group"
              data-testid={`button-favorite-${city.id}`}
            >
              <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div>
                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {city.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {city.country}
                </div>
              </div>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFavorite(city.id)}
              disabled={isRemovingFavorite}
              className="text-muted-foreground hover:text-red-500 h-8 w-8 p-0"
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