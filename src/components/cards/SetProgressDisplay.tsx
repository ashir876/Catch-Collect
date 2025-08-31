import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star, Heart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { SetProgress } from "@/hooks/useSetProgress";

interface SetProgressDisplayProps {
  progress: SetProgress;
  showProgressBar?: boolean;
  showCompletionBadge?: boolean;
  variant?: "compact" | "detailed" | "card";
  className?: string;
}

const SetProgressDisplay: React.FC<SetProgressDisplayProps> = ({
  progress,
  showProgressBar = true,
  showCompletionBadge = true,
  variant = "detailed",
  className
}) => {
  const { t } = useTranslation();

  const {
    set_name,
    total_cards,
    collected_cards,
    wishlist_cards,
    completion_percentage,
    is_completed
  } = progress;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{total_cards}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-accent" />
          <span className="font-medium">{collected_cards}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-medium">{wishlist_cards}</span>
        </div>
        {is_completed && showCompletionBadge && (
          <Badge variant="default" className="bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('sets.completed')}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={cn("border-2 border-black", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm uppercase tracking-wide">
                {set_name}
              </h4>
              {is_completed && showCompletionBadge && (
                <Badge variant="default" className="bg-green-600 text-white text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('sets.completed')}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-lg">{total_cards}</span>
                </div>
                <div className="text-xs text-muted-foreground uppercase font-bold">
                  {t('sets.total')}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="font-bold text-lg">{collected_cards}</span>
                </div>
                <div className="text-xs text-muted-foreground uppercase font-bold">
                  {t('sets.collected')}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-lg">{wishlist_cards}</span>
                </div>
                <div className="text-xs text-muted-foreground uppercase font-bold">
                  {t('sets.wishlist')}
                </div>
              </div>
            </div>

            {showProgressBar && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>{t('sets.progress')}</span>
                  <span>{completion_percentage}%</span>
                </div>
                <Progress 
                  value={completion_percentage} 
                  className="h-2"
                  indicatorClassName={cn(
                    "bg-gradient-to-r",
                    is_completed ? "from-green-500 to-green-600" : "from-blue-500 to-blue-600"
                  )}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default detailed variant
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm uppercase tracking-wide">
          {set_name}
        </h4>
        {is_completed && showCompletionBadge && (
          <Badge variant="default" className="bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('sets.completed')}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            <span className="font-bold text-xl">{total_cards}</span>
          </div>
          <div className="text-sm text-muted-foreground uppercase font-bold">
            {t('sets.totalCards')}
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-bold text-xl">{collected_cards}</span>
          </div>
          <div className="text-sm text-muted-foreground uppercase font-bold">
            {t('sets.collected')}
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-bold text-xl">{wishlist_cards}</span>
          </div>
          <div className="text-sm text-muted-foreground uppercase font-bold">
            {t('sets.wishlist')}
          </div>
        </div>
      </div>

      {showProgressBar && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span>{t('sets.completionProgress')}</span>
            <span>{completion_percentage}%</span>
          </div>
          <Progress 
            value={completion_percentage} 
            className="h-3"
            indicatorClassName={cn(
              "bg-gradient-to-r",
              is_completed ? "from-green-500 to-green-600" : "from-blue-500 to-blue-600"
            )}
          />
        </div>
      )}
    </div>
  );
};

export default SetProgressDisplay;
