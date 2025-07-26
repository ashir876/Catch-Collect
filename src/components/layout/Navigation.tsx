
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Grid3X3, 
  Package, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu,
  X,
  Star,
  Trophy,
  Settings,
  LogIn,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useWishlistCount } from "@/hooks/useWishlistData";
import { useCartCount } from "@/hooks/useCartCount";

interface NavItem {
  path: string;
  label: string;
  icon: any;
  badge?: number;
}

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  
  // Get dynamic counts
  const { data: wishlistCount = 0 } = useWishlistCount();
  const { data: cartCount = 0 } = useCartCount();

  const mainNavItems: NavItem[] = [
    { path: "/", label: t('navigation.home'), icon: Home },
    { path: "/series", label: t('navigation.series'), icon: Grid3X3 },
    { path: "/sets", label: t('navigation.sets'), icon: Package },
    { path: "/cards", label: t('navigation.cards'), icon: Star },
    { path: "/shop", label: t('navigation.shop'), icon: ShoppingCart }
  ];

  const authenticatedNavItems: NavItem[] = [
    { path: "/collection", label: t('navigation.collection'), icon: Trophy },
    { path: "/wishlist", label: t('navigation.wishlist'), icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
    { path: "/cart", label: t('navigation.cart'), icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { path: "/profile", label: t('navigation.profile'), icon: User },
    { path: "/settings", label: t('navigation.settings'), icon: Settings }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/Catch-Collect-uploads/a2f24a7d-97d1-4e80-a75b-8cadfd0435ea.png" 
              alt="Catch Collect Logo" 
              className="h-16 w-auto pixelated hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {mainNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={isActive(item.path) ? "pixel-nav-item-active" : "pixel-nav-item"}>
                  <item.icon className="w-4 h-4 mr-2 inline" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="pixel-badge ml-2">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* User Menu Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            {user ? (
              <>
                {authenticatedNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <div className={cn(
                      "relative border-2 border-black px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors",
                      isActive(item.path) ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <item.icon className="w-4 h-4" />
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground border-2 border-black text-xs min-w-5 h-5 flex items-center justify-center font-black">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-2 border-black font-black"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('navigation.signOut')}
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="border-2 border-black font-black uppercase">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('navigation.auth')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden border-2 border-black bg-muted px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-4 border-black bg-background py-4">
            <div className="space-y-2">
              {/* Language Switcher for Mobile */}
              <div className="mx-2 mb-4">
                <LanguageSwitcher />
              </div>
              
              <div className="space-y-2">
                <p className="px-3 text-sm font-black uppercase tracking-wide">{t('navigation.navigation')}</p>
                {mainNavItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      "mx-2 border-2 border-black px-4 py-3 font-black uppercase text-sm transition-colors",
                      isActive(item.path) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary hover:text-primary-foreground"
                    )}>
                      <item.icon className="w-4 h-4 mr-2 inline" />
                      {item.label}
                      {item.badge && (
                        <span className="pixel-badge ml-auto">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {user ? (
                <div className="space-y-2 pt-4">
                  <p className="px-3 text-sm font-black uppercase tracking-wide">{t('navigation.user')}</p>
                  {authenticatedNavItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "mx-2 border-2 border-black px-4 py-3 font-black uppercase text-sm transition-colors",
                        isActive(item.path) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary hover:text-primary-foreground"
                      )}>
                        <item.icon className="w-4 h-4 mr-2 inline" />
                        {item.label}
                        {item.badge && (
                          <span className="pixel-badge ml-auto">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <div className="mx-2 mt-2">
                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-2 border-black font-black uppercase"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('navigation.signOut')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4">
                  <div className="mx-2">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full border-2 border-black font-black uppercase">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('navigation.auth')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
