
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Grid3X3, Star } from "lucide-react";
import { useSeriesData } from "@/hooks/useSeriesData";
import { useCardsData } from "@/hooks/useCardsData";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const { data: seriesData, isLoading: seriesLoading } = useSeriesData({ language: 'en' });
  const { data: cardsData, isLoading: cardsLoading } = useCardsData({ 
    language: 'en', 
    limit: 8 
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Cubes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float-1 absolute top-20 left-10 w-12 h-12 bg-primary/20 border-2 border-black transform rotate-12"></div>
        <div className="animate-float-2 absolute top-40 right-20 w-8 h-8 bg-accent/20 border-2 border-black transform -rotate-45"></div>
        <div className="animate-float-3 absolute bottom-60 left-1/4 w-10 h-10 bg-secondary/20 border-2 border-black transform rotate-45"></div>
        <div className="animate-float-1 absolute bottom-40 right-1/3 w-6 h-6 bg-primary/30 border-2 border-black transform -rotate-12"></div>
        <div className="animate-float-2 absolute top-1/3 left-1/2 w-14 h-14 bg-accent/10 border-2 border-black transform rotate-45"></div>
        <div className="animate-float-3 absolute top-60 right-10 w-9 h-9 bg-secondary/25 border-2 border-black transform -rotate-45"></div>
        <div className="animate-float-1 absolute bottom-20 left-1/2 w-7 h-7 bg-primary/15 border-2 border-black transform rotate-12"></div>
        <div className="animate-float-2 absolute top-32 left-1/3 w-11 h-11 bg-accent/25 border-2 border-black transform -rotate-12"></div>
      </div>

      {/* Main Hero Section - Centered Design */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative z-10">
        <div className="container mx-auto text-center px-4">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/Catch-Collect-uploads/a2f24a7d-97d1-4e80-a75b-8cadfd0435ea.png" 
              alt="Catch Collect Logo" 
              className="h-32 md:h-48 w-auto mx-auto pixelated drop-shadow-2xl"
            />
          </div>
          
          {/* Main Title with Yellow Animation */}
          <h1 className="pixel-text-yellow-animated mb-4">
            {t('home.mainTitle')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 font-bold max-w-2xl mx-auto">
            {t('home.mainSubtitle')}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/shop">
              <Button className="pixel-button text-lg px-12 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200">
                {t('home.shopNow')}
              </Button>
            </Link>
            <Link to="/collection">
              <Button className="pixel-button-secondary text-lg px-12 py-6 hover:scale-105 transition-all duration-200">
                {t('home.myCollection')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Series Section */}
      <section className="py-16 px-4 bg-background relative z-10">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black text-center mb-12 uppercase tracking-wider">
            <span className="bg-primary text-primary-foreground px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {t('home.pokemonSeries')}
            </span>
          </h2>
          
          {seriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="pixel-card animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seriesData?.slice(0, 6).map((series) => (
                <Link key={series.series_id} to={`/series`}>
                  <div className="pixel-card group hover:scale-105 transition-all duration-300">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
                      {series.logo_url ? (
                        <img 
                          src={series.logo_url} 
                          alt={series.series_name || t('series.title')} 
                          className="max-h-full max-w-full object-contain pixelated"
                        />
                      ) : (
                        <div className="text-white font-black text-2xl text-center">
                          {series.series_name}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-background border-t-4 border-black">
                      <h3 className="font-black text-lg uppercase tracking-wide mb-2">
                        {series.series_name}
                      </h3>
                      <p className="text-muted-foreground font-bold text-sm">
                        ID: {series.series_id}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/series">
              <Button className="pixel-button text-lg px-8 py-4 hover:scale-105 transition-all duration-200">
                <Grid3X3 className="mr-2 h-5 w-5 animate-bounce" />
                {t('home.showAllSeries')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cards Section */}
      <section className="py-16 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-4xl font-black text-center mb-12 uppercase tracking-wider">
            <span className="bg-accent text-accent-foreground px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {t('home.featuredCards')}
            </span>
          </h2>
          
          {cardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="pixel-card animate-pulse">
                  <div className="aspect-[3/4] bg-muted"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cardsData?.map((card) => (
                <Link key={card.card_id} to={`/card/${card.card_id}`}>
                  <div className="pixel-card group hover:brightness-110 hover:scale-105 transition-all duration-300">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img 
                        src={card.image_url || '/placeholder.svg'} 
                        alt={card.name || t('cards.card')} 
                        className="w-full h-full object-cover pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 bg-background border-t-4 border-black">
                      <h3 className="font-black text-sm uppercase tracking-wide mb-1 truncate">
                        {card.name}
                      </h3>
                      <p className="text-muted-foreground font-bold text-xs mb-2">
                        {card.set_name}
                      </p>
                      {card.rarity && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-bold uppercase">{card.rarity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/cards">
              <Button className="pixel-button text-lg px-8 py-4 hover:scale-105 transition-all duration-200">
                <Star className="mr-2 h-5 w-5 animate-pulse" />
                {t('home.browseAllCards')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-4 bg-primary text-primary-foreground relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-black uppercase mb-8 tracking-wider drop-shadow-lg">
            {t('home.readyForAdventure')}
          </h2>
          <p className="text-xl font-bold mb-12">
            {t('home.adventureSubtitle')}
          </p>
          <div className="space-x-4">
            <Link to="/collection">
              <Button className="pixel-button text-lg px-8 py-4 bg-background text-foreground hover:scale-105 transition-all duration-200">
                {t('home.myCollection')}
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="secondary" className="pixel-button text-lg px-8 py-4 hover:scale-105 transition-all duration-200">
                {t('home.myWishlist')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
