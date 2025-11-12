import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Database,
  Settings,
  BarChart3,
  Activity,
  DollarSign,
  ShoppingCart
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topSellingCards: Array<{ name: string; sales: number }>;
  recentOrders: Array<{ id: string; user_email: string; total: number; status: string }>;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'analytics' | 'settings'>('overview');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalCards } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          profiles:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const mockStats: AdminStats = {
        totalUsers: totalUsers || 0,
        totalCards: totalCards || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        activeUsers: Math.floor((totalUsers || 0) * 0.7),
        newUsersThisMonth: Math.floor((totalUsers || 0) * 0.1),
        topSellingCards: [
          { name: 'Charizard', sales: 45 },
          { name: 'Pikachu', sales: 38 },
          { name: 'Blastoise', sales: 32 },
          { name: 'Venusaur', sales: 28 }
        ],
        recentOrders: recentOrders?.map(order => ({
          id: order.id,
          user_email: order.profiles?.email || 'Unknown',
          total: order.total_amount || 0,
          status: order.status
        })) || [],
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          storage: 'warning'
        }
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
            {t('admin.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.dashboardSubtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="pixel-button">
            <Settings className="h-4 w-4 mr-2" />
            {t('admin.settings')}
          </Button>
          <Button variant="outline" className="pixel-button-secondary">
            <Database className="h-4 w-4 mr-2" />
            {t('admin.backup')}
          </Button>
        </div>
      </div>

      {}
      <div className="flex gap-2 mb-8 border-b-4 border-black">
        {[
          { key: 'overview', label: t('admin.overview'), icon: BarChart3 },
          { key: 'users', label: t('admin.users'), icon: Users },
          { key: 'orders', label: t('admin.orders'), icon: ShoppingCart },
          { key: 'analytics', label: t('admin.analytics'), icon: Activity },
          { key: 'settings', label: t('admin.settings'), icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.key as any)}
              className="pixel-button"
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="pixel-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-5 w-5 text-blue-500" />
                  {t('admin.totalUsers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newUsersThisMonth} {t('admin.thisMonth')}
                </p>
              </CardContent>
            </Card>

            <Card className="pixel-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {t('admin.totalCards')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.cardsInDatabase')}
                </p>
              </CardContent>
            </Card>

            <Card className="pixel-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  {t('admin.totalOrders')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.ordersProcessed')}
                </p>
              </CardContent>
            </Card>

            <Card className="pixel-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                  {t('admin.totalRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('admin.lifetimeRevenue')}
                </p>
              </CardContent>
            </Card>
          </div>

          {}
          <Card className="pixel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('admin.systemHealth')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.systemHealth).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-semibold capitalize">{service}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(status)}`}></div>
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {}
          <Card className="pixel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('admin.topSellingCards')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topSellingCards.map((card, index) => (
                  <div key={card.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-semibold">{card.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t('admin.sales')}</span>
                      <Badge variant="secondary">{card.sales}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {}
          <Card className="pixel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('admin.recentOrders')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`}></div>
                      <div>
                        <p className="font-semibold text-sm">{order.user_email}</p>
                        <p className="text-xs text-muted-foreground">#{order.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {}
      {activeTab === 'users' && (
        <Card className="pixel-card">
          <CardHeader>
            <CardTitle>{t('admin.userManagement')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('admin.userManagementDescription')}</p>
          </CardContent>
        </Card>
      )}

      {}
      {activeTab === 'orders' && (
        <Card className="pixel-card">
          <CardHeader>
            <CardTitle>{t('admin.orderManagement')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('admin.orderManagementDescription')}</p>
          </CardContent>
        </Card>
      )}

      {}
      {activeTab === 'analytics' && (
        <Card className="pixel-card">
          <CardHeader>
            <CardTitle>{t('admin.analytics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('admin.analyticsDescription')}</p>
          </CardContent>
        </Card>
      )}

      {}
      {activeTab === 'settings' && (
        <Card className="pixel-card">
          <CardHeader>
            <CardTitle>{t('admin.systemSettings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('admin.systemSettingsDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard; 