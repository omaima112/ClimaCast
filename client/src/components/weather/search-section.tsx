import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchSectionProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function SearchSection({ onSearch, isLoading, error }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-8" data-testid="heading-search">
        How's the sky looking today?
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a city, e.g., New York"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border-border text-foreground placeholder-muted-foreground focus:ring-ring"
            disabled={isLoading}
            data-testid="input-search"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="px-8 py-4 bg-weather-blue hover:bg-weather-blue-dark text-white font-semibold flex items-center justify-center gap-2"
          data-testid="button-search"
        >
          <span>Search</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>
      </form>

      {error && (
        <Alert className="mt-4 max-w-2xl mx-auto bg-destructive/10 border-destructive/20 text-destructive" data-testid="alert-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
