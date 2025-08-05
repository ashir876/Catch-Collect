import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Heart, 
  ShoppingCart, 
  Target,
  TrendingUp,
  Award,
  Crown
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  totalCards: number;
  collectionCards: number;
  wishlistCards: number;
  cartItems: number;
  completionRate: number;
  uniqueSets: number;
  uniqueSeries: number;
  rarestCard: string;
  recentAdditions: number;
}

const UserStats = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get collection count
        const { count: collectionCount } = await supabase
          .from('card_collections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get wishlist count
        const { count: wishlistCount } = await supabase
          .from('card_wishlist')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get cart count
        const { count: cartCount } = await supabase
          .from('carts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get total cards count
        const { count: totalCards } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true });

        // Get unique sets in collection
        const { data: collectionSets } = await supabase
          .from('card_collections')
          .select('set_id')
          .eq('user_id', user.id)
          .not('set_id', 'is', null);

        const uniqueSets = new Set(collectionSets?.map(item => item.set_id).filter(Boolean)).size;

        // Get unique series in collection
        const { data: collectionSeries } = await supabase
          .from('card_collections')
          .select('set_id')
          .eq('user_id', user.id)
          .not('set_id', 'is', null);

        // For now, we'll count unique sets as series since we don't have direct series_id
        const uniqueSeries = uniqueSets;

        // Get rarest card in collection
        const { data: rarestCard } = await supabase
          .from('card_collections')
          .select('name, rarity')
          .eq('user_id', user.id)
          .not('rarity', 'is', null)
          .order('rarity', { ascending: false })
          .limit(1)
          .single();

        // Get recent additions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentAdditions } = await supabase
          .from('card_collections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString());

        const completionRate = totalCards ? Math.round((collectionCount || 0) / totalCards * 100) : 0;

        setStats({
          totalCards: totalCards || 0,
          collectionCards: collectionCount || 0,
          wishlistCards: wishlistCount || 0,
          cartItems: cartCount || 0,
          completionRate,
          uniqueSets,
          uniqueSeries,
          rarestCard: rarestCard?.name || t('stats.noCards'),
          recentAdditions: recentAdditions || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, t]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="pixel-card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getAchievementLevel = (completionRate: number) => {
    if (completionRate >= 90) return { level: 'Master', icon: Crown, color: 'text-yellow-500' };
    if (completionRate >= 75) return { level: 'Expert', icon: Award, color: 'text-purple-500' };
    if (completionRate >= 50) return { level: 'Advanced', icon: TrendingUp, color: 'text-blue-500' };
    if (completionRate >= 25) return { level: 'Intermediate', icon: Target, color: 'text-green-500' };
    return { level: 'Beginner', icon: Star, color: 'text-gray-500' };
  };

  const achievement = getAchievementLevel(stats.completionRate);
  const AchievementIcon = achievement.icon;

  return (
    <div className="space-y-6">
      {/* Achievement Card */}
      <Card className="pixel-card bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AchievementIcon className={`h-6 w-6 ${achievement.color}`} />
            {t('stats.achievement')}: {achievement.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('stats.completionRate')}</span>
                <span>{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('stats.completionDescription', { 
                collected: stats.collectionCards, 
                total: stats.totalCards 
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="pixel-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {t('stats.collection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionCards}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.cardsCollected')}
            </p>
          </CardContent>
        </Card>

        <Card className="pixel-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-red-500" />
              {t('stats.wishlist')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wishlistCards}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.cardsWanted')}
            </p>
          </CardContent>
        </Card>

        <Card className="pixel-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              {t('stats.cart')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cartItems}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.itemsInCart')}
            </p>
          </CardContent>
        </Card>

        <Card className="pixel-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-green-500" />
              {t('stats.recent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAdditions}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.last30Days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="pixel-card">
          <CardHeader>
            <CardTitle className="text-sm">{t('stats.collectionDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">{t('stats.uniqueSets')}</span>
              <Badge variant="outline">{stats.uniqueSets}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{t('stats.uniqueSeries')}</span>
              <Badge variant="outline">{stats.uniqueSeries}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{t('stats.rarestCard')}</span>
              <span className="text-sm font-medium truncate max-w-32">
                {stats.rarestCard}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="pixel-card">
          <CardHeader>
            <CardTitle className="text-sm">{t('stats.progress')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('stats.collectionProgress')}</span>
                <span>{stats.collectionCards}/{stats.totalCards}</span>
              </div>
              <Progress value={(stats.collectionCards / stats.totalCards) * 100} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              {t('stats.progressDescription')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserStats; 