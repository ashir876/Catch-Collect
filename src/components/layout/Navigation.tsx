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
  Shield
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
    { path: "/", label: "HOME", icon: Home },
    { path: "/cards", label: "CARDS", icon: Star },
    { path: "/series", label: "SERIES", icon: Grid3X3 },
    { path: "/sets", label: "SETS", icon: Package },
    
    { path: "/shop", label: "SHOP", icon: ShoppingCart }
  ];

  const authenticatedNavItems: NavItem[] = [
    { path: "/wishlist", label: "", icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
    { path: "/cart", label: "", icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { path: "/profile", label: "", icon: User },
    { path: "/settings", label: "", icon: Settings }
  ];

  // Add admin link if user has admin role (you can implement role checking here)
  const adminNavItems: NavItem[] = [
    { path: "/admin", label: t('navigation.admin'), icon: Shield }
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
              {user ? (
                <>
                  {authenticatedNavItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <div className="pixel-nav-item-small">
                        <item.icon className="w-4 h-4" />
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
                        <item.icon className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="pixel-button-secondary"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="pixel-button">
                    <LogIn className="w-4 h-4" />
                    {t('navigation.auth')}
                  </Button>
                </Link>
              )}
              <LanguageSwitcher />
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="pixel-button-small"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-4 border-black bg-background">
            <div className="py-4 space-y-2">
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
                  {/* Admin navigation items for mobile */}
                  {adminNavItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "mx-2 border-2 border-red-600 px-4 py-3 font-black uppercase text-sm transition-colors",
                        isActive(item.path) ? "bg-red-600 text-white" : "bg-red-50 hover:bg-red-600 hover:text-white"
                      )}>
                        <item.icon className="w-4 h-4 mr-2 inline" />
                        {item.label}
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