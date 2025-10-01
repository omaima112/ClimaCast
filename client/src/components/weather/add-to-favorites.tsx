import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, StarOff, Plus } from "lucide-react";
import { type WeatherData, type InsertFavoriteCity } from "@/types/schema";

interface AddToFavoritesProps {
  weatherData: WeatherData;
  className?: string;
}

export function AddToFavorites({ weatherData, className }: AddToFavoritesProps) {
  const { addFavorite, removeFavorite, isFavorite, getFavoriteByCoordinates, isAddingFavorite, isRemovingFavorite } = useFavorites();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");

  // FIXED: Use correct property names from weatherData
  const { latitude, longitude } = weatherData.location.coordinates;
  const isCurrentlyFavorite = isFavorite(latitude, longitude);
  const favoriteCity = getFavoriteByCoordinates(latitude, longitude);

  const handleQuickAdd = () => {
    if (isCurrentlyFavorite && favoriteCity) {
      removeFavorite(favoriteCity.id);
    } else {
      const cityData: InsertFavoriteCity = {
        name: weatherData.location.city,
        city: weatherData.location.city,
        country: weatherData.location.country,
        latitude: latitude,  // FIXED: Now using correct variable
        longitude: longitude, // FIXED: Now using correct variable
      };
      addFavorite(cityData);
    }
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;

    const cityData: InsertFavoriteCity = {
      name: customName.trim(),
      city: weatherData.location.city,
      country: weatherData.location.country,
      latitude: latitude,  // FIXED: Now using correct variable
      longitude: longitude, // FIXED: Now using correct variable
    };
    
    addFavorite(cityData);
    setIsDialogOpen(false);
    setCustomName("");
  };

  const isPending = isAddingFavorite || isRemovingFavorite;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isCurrentlyFavorite ? "default" : "outline"}
        size="sm"
        onClick={handleQuickAdd}
        disabled={isPending}
        className="flex items-center gap-2"
        data-testid="button-quick-favorite"
      >
        {isCurrentlyFavorite ? (
          <>
            <Star className="w-4 h-4 fill-current" />
            Favorited
          </>
        ) : (
          <>
            <StarOff className="w-4 h-4" />
            Add to Favorites
          </>
        )}
      </Button>

      {!isCurrentlyFavorite && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              data-testid="button-custom-favorite"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Favorite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city-name">Custom Name</Label>
                <Input
                  id="city-name"
                  placeholder="Enter a custom name for this location"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  data-testid="input-custom-name"
                />
                <p className="text-sm text-muted-foreground">
                  Location: {weatherData.location.city}, {weatherData.location.country}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-favorite"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCustomAdd}
                  disabled={!customName.trim() || isPending}
                  data-testid="button-save-favorite"
                >
                  Add to Favorites
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}