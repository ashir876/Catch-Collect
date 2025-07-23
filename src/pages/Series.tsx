
import { Link } from "react-router-dom";
import { Grid3X3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeriesData } from "@/hooks/useSeriesData";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const Series = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: seriesData, isLoading, error } = useSeriesData('en');

  const filteredSeries = seriesData?.filter(series =>
    series.series_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.series_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-black mb-4">{t('series.loadError')}</h1>
          <p className="text-muted-foreground">{t('series.loadErrorSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-wider">
            <span className="bg-primary text-primary-foreground px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {t('series.title')}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground font-bold">
            {t('series.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('series.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-black font-bold"
            />
          </div>
        </div>

        {/* Series Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="border-4 border-black animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredSeries && filteredSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSeries.map((series) => (
              <Link key={series.series_id} to={`/sets?series=${series.series_id}`}>
                <Card className="border-4 border-black hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer group">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4 overflow-hidden">
                    {series.logo_url ? (
                      <img 
                        src={series.logo_url} 
                        alt={series.series_name || 'Series'} 
                        className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-white font-black text-2xl text-center group-hover:scale-110 transition-transform duration-300">
                        <Grid3X3 className="h-16 w-16 mx-auto mb-2" />
                        {series.series_name}
                      </div>
                    )}
                  </div>
                  <CardHeader className="bg-background">
                    <CardTitle className="font-black text-lg uppercase tracking-wide">
                      {series.series_name}
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground">
                      ID: {series.series_id}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-black mb-2">{t('series.noSeriesFound')}</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `${t('series.noSeriesSubtitle')} "${searchTerm}"` : t('series.noSeriesSubtitle')}
            </p>
          </div>
        )}

        {/* Stats */}
        {filteredSeries && (
          <div className="mt-16 text-center">
            <Card className="border-4 border-black bg-muted/50 inline-block hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Grid3X3 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-black text-primary">
                      {filteredSeries.length}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                      {t('series.seriesAvailable')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;
