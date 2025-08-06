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
  LogOut,
  Shield,
  BookOpen
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
  shortLabel?: string; // For mobile display
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
    { path: "/", label: "HOME", shortLabel: "HOME", icon: Home },
    { path: "/series", label: "SERIES", shortLabel: "SERIES", icon: Grid3X3 },
    { path: "/sets", label: "SETS", shortLabel: "SETS", icon: Package },
    { path: "/cards", label: "CARDS", shortLabel: "CARDS", icon: Star },
    { path: "/shop", label: "SHOP", shortLabel: "SHOP", icon: ShoppingCart }
  ];

  const authenticatedNavItems: NavItem[] = [
    { path: "/wishlist", label: t('navigation.wishlist'), shortLabel: t('navigation.wishlist'), icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
    { path: "/collection", label: t('navigation.collection'), shortLabel: t('navigation.collection'), icon: BookOpen },
    { path: "/cart", label: t('navigation.cart'), shortLabel: t('navigation.cart'), icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { path: "/profile", label: t('navigation.profile'), shortLabel: t('navigation.profile'), icon: User },
    { path: "/settings", label: t('navigation.settings'), shortLabel: t('navigation.settings'), icon: Settings }
  ];

  // Desktop-only icon items (without labels)
  const desktopIconItems: NavItem[] = [
    { path: "/wishlist", label: "", icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
    { path: "/collection", label: "", icon: BookOpen },
    { path: "/cart", label: "", icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { path: "/profile", label: "", icon: User },
    { path: "/settings", label: "", icon: Settings }
  ];

  // Add admin link if user has admin role (you can implement role checking here)
  const adminNavItems: NavItem[] = [
    { path: "/admin", label: t('navigation.admin'), shortLabel: t('navigation.admin'), icon: Shield }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/Catch-Collect-uploads/a2f24a7d-97d1-4e80-a75b-8cadfd0435ea.png" 
              alt="Catch Collect Logo" 
              className="h-12 sm:h-16 w-auto pixelated hover:scale-105 transition-transform duration-200"
            />
          </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {mainNavItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <div className={isActive(item.path) ? "pixel-nav-item-active" : "pixel-nav-item"}>
                    <item.icon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" />
                    <span className="text-xs lg:text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="pixel-badge ml-1 lg:ml-2">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* User Menu Desktop */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {user ? (
                <>
                  {desktopIconItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <div className="pixel-nav-item-small">
                        <item.icon className="w-3 h-3 lg:w-4 lg:h-4" />
                        {item.badge && (
                          <span className="pixel-badge-small">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {/* Admin navigation items */}
                  {adminNavItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <div className={isActive(item.path) ? "pixel-nav-item-admin-active" : "pixel-nav-item-admin"}>
                        <item.icon className="w-3 h-3 lg:w-4 lg:h-4" />
                      </div>
                    </Link>
                  ))}
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-red-500 hover:bg-red-600 text-white border-2 border-black px-2 lg:px-3 py-1 lg:py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100"
                  >
                    <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="pixel-button text-xs lg:text-sm">
                    <LogIn className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">{t('navigation.auth')}</span>
                    <span className="lg:hidden">LOGIN</span>
                  </Button>
                </Link>
              )}
              <div className="relative">
                <LanguageSwitcher />
              </div>
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="pixel-button-small"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-4 border-black bg-background">
            <div className="py-3 sm:py-4 space-y-1 sm:space-y-2">
              <div className="mx-2 mb-3 sm:mb-4">
                <LanguageSwitcher />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <p className="px-3 text-xs sm:text-sm font-black uppercase tracking-wide">{t('navigation.navigation')}</p>
                {mainNavItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      "mx-2 border-2 border-black px-3 sm:px-4 py-2 sm:py-3 font-black uppercase text-xs sm:text-sm transition-colors flex items-center justify-between",
                      isActive(item.path) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary hover:text-primary-foreground"
                    )}>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.shortLabel || item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="pixel-badge flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {user ? (
                <div className="space-y-1 sm:space-y-2 pt-3 sm:pt-4">
                  <p className="px-3 text-xs sm:text-sm font-black uppercase tracking-wide">{t('navigation.user')}</p>
                  {authenticatedNavItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "mx-2 border-2 border-black px-3 sm:px-4 py-2 sm:py-3 font-black uppercase text-xs sm:text-sm transition-colors flex items-center justify-between",
                        isActive(item.path) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary hover:text-primary-foreground"
                      )}>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.shortLabel || item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="pixel-badge flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {/* Admin navigation items for mobile */}
                  {adminNavItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "mx-2 border-2 border-red-600 px-3 sm:px-4 py-2 sm:py-3 font-black uppercase text-xs sm:text-sm transition-colors flex items-center justify-between",
                        isActive(item.path) ? "bg-red-600 text-white" : "bg-red-50 hover:bg-red-600 hover:text-white"
                      )}>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.shortLabel || item.label}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="mx-2 mt-2">
                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full bg-red-500 hover:bg-red-600 text-white border-2 border-black font-black uppercase text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100"
                    >
                      <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{t('navigation.signOut')}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 sm:pt-4">
                  <div className="mx-2">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full border-2 border-black font-black uppercase text-xs sm:text-sm">
                        <LogIn className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{t('navigation.auth')}</span>
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