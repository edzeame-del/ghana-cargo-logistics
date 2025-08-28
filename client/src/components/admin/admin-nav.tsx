import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Ship, Package, LogOut, Search, Database, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ChangePasswordDialog from "./change-password-dialog";

export default function AdminNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      href: "/admin/vessels",
      label: "Vessels",
      icon: Ship,
      isActive: location === "/admin/vessels"
    },
    {
      href: "/admin/tracking",
      label: "Tracking Data",
      icon: Package,
      isActive: location === "/admin/tracking"
    },
    {
      href: "/admin/search-logs",
      label: "Search Logs",
      icon: Search,
      isActive: location === "/admin/search-logs"
    },
    {
      href: "/admin/database-search",
      label: "Database Search",
      icon: Database,
      isActive: location === "/admin/database-search"
    }
  ];

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" onClick={closeMobileMenu}>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Admin Panel</h2>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={item.isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2 px-3"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Info & Actions - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-sm text-gray-600 hidden xl:inline">
              Welcome, {user?.username}
            </span>
            <ChangePasswordDialog />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </span>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="px-3">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-6 border-b">
                    <div>
                      <h3 className="font-semibold text-lg">Admin Menu</h3>
                      <p className="text-sm text-muted-foreground">Welcome, {user?.username}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={closeMobileMenu}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex flex-col space-y-1 flex-1 py-6">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                        <Button 
                          variant={item.isActive ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-12 px-4"
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Bottom Actions */}
                  <div className="border-t pt-6 space-y-3">
                    <div className="w-full">
                      <ChangePasswordDialog />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 px-4"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-5 w-5" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}