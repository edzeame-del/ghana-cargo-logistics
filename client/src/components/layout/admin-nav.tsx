import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Ship, Database, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function AdminNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const navItems = [
    {
      label: "Vessels",
      href: "/admin/vessels",
      icon: Ship,
    },
    {
      label: "Tracking Data",
      href: "/admin/tracking",
      icon: Database,
    },
    {
      label: "Search Logs",
      href: "/admin/search-logs",
      icon: Search,
    },
  ];

  return (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-muted-foreground mr-4">Admin Panel:</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 px-3 text-sm",
                      location === item.href && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}