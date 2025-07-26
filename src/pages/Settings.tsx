import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Crown, Star, Trophy, Medal, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loyaltyPoints] = useState(47); // CHF 470 spent = 47 points
  const [customerTier] = useState("Shining");
  const [totalSpent] = useState(470);

  const customerTiers = [
    { name: "Promo", minSpent: 0, icon: Gift, color: "bg-gray-500" },
    { name: "Uncommon", minSpent: 100, icon: Medal, color: "bg-green-500" },
    { name: "Rare", minSpent: 250, icon: Star, color: "bg-blue-500" },
    { name: "Holo Rare", minSpent: 500, icon: Trophy, color: "bg-purple-500" },
    { name: "Shining", minSpent: 1000, icon: Crown, color: "bg-yellow-500" },
  ];

  const currentTierIndex = customerTiers.findIndex(tier => tier.name === customerTier);
  const nextTier = customerTiers[currentTierIndex + 1];
  const progressToNextTier = nextTier ? 
    ((totalSpent - customerTiers[currentTierIndex].minSpent) / (nextTier.minSpent - customerTiers[currentTierIndex].minSpent)) * 100 
    : 100;

  const handleSaveSettings = () => {
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDescription'),
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>

        {/* Loyalty Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {t('settings.loyaltyProgram')}
            </CardTitle>
            <CardDescription>
              {t('settings.loyaltyDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.currentPoints')}</p>
                <p className="text-2xl font-bold">{loyaltyPoints} {t('settings.points')}</p>
              </div>
              <Badge variant="secondary" className={`${customerTiers[currentTierIndex].color} text-white`}>
                {customerTier}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('settings.progressToNextLevel')}</span>
                {nextTier && <span>{nextTier.name}</span>}
              </div>
              <Progress value={progressToNextTier} className="h-2" />
              {nextTier && (
                <p className="text-xs text-muted-foreground">
                  {t('settings.remainingToNextLevel', { amount: nextTier.minSpent - totalSpent, tier: nextTier.name })}
                </p>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {customerTiers.map((tier, index) => {
                const TierIcon = tier.icon;
                const isUnlocked = index <= currentTierIndex;
                return (
                  <div key={tier.name} className="text-center">
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      isUnlocked ? tier.color : 'bg-gray-200'
                    }`}>
                      <TierIcon className={`h-5 w-5 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <p className={`text-xs ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {tier.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.accountSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('settings.firstName')}</Label>
                <Input id="firstName" defaultValue="Max" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('settings.lastName')}</Label>
                <Input id="lastName" defaultValue="Mustermann" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input id="email" type="email" defaultValue="max.mustermann@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('settings.address')}</Label>
              <Input id="address" defaultValue="Musterstraße 123, 8000 Zürich" />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">{t('settings.emailNotifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.emailNotificationsDescription')}
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">{t('settings.darkMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.darkModeDescription')}
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSaveSettings} className="w-full">
          {t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;