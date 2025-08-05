import React, { useState, useEffect } from "react";
import { User, Mail, Calendar, Trophy, Star, Package, Heart, ShoppingCart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(10);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.full_name || '',
    email: userProfile?.email || ''
  });

  // Update form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.full_name || '',
        email: userProfile.email || ''
      });
    }
  }, [userProfile]);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Promo":
        return "secondary";
      case "Rare":
        return "default";
      case "Epic":
        return "destructive";
      case "Shining":
        return "default";
      default:
        return "secondary";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingCart className="h-4 w-4" />;
      case "wishlist":
        return <Heart className="h-4 w-4" />;
      case "collection":
        return <Package className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  // Show loading state
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{t('profile.errorLoading')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  // If no user profile data, show message
  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('profile.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('profile.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('profile.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('profile.overview')}</TabsTrigger>
          <TabsTrigger value="settings">{t('profile.settings')}</TabsTrigger>
          <TabsTrigger value="activity">{t('profile.activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={userProfile.full_name || userProfile.email} />
                  <AvatarFallback className="text-lg">
                    {(userProfile.full_name || userProfile.email).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{userProfile.full_name || userProfile.email}</h2>
                    <Badge variant={getCategoryColor(userProfile.account_type || 'default')} className="text-sm">
                      {userProfile.account_type || 'Standard'} {t('profile.collector')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t('profile.memberSince')} {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : t('profile.unknown')}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.cards')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile.totalCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('profile.inCollection')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.collectionValue')}</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF {userProfile.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('profile.estimatedValue')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.completedSets')}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile.setsCompleted}</div>
                <p className="text-xs text-muted-foreground">{t('profile.completeSets')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.wishlist')}</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile.wishlistItems}</div>
                <p className="text-xs text-muted-foreground">{t('profile.desiredCards')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('profile.loyaltyPoints')}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile.loyalty_points || 0}</div>
                <p className="text-xs text-muted-foreground">{t('profile.pointsCollected')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Loyalty Program */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.loyaltyProgram')}</CardTitle>
              <CardDescription>
                {t('profile.loyaltyDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{t('profile.currentCategory')}:</span>
                  <Badge variant={getCategoryColor(userProfile.account_type || 'default')}>
                    {userProfile.account_type || 'Standard'} {t('profile.collector')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('profile.currentPoints')}:</span>
                  <span className="font-bold">{userProfile.loyalty_points || 0} {t('profile.points')}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('profile.toNextCategory')}:</span>
                    <span>53 {t('profile.points')}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
              <CardDescription>
                {t('profile.updateAccountInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('profile.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>{t('common.save')}</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {t('common.cancel')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.recentActivity')}</CardTitle>
              <CardDescription>
                {t('profile.recentActivityDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {activity.value && (
                        <Badge variant="secondary">
                          CHF {activity.value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('profile.noActivity')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;