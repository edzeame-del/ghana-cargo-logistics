import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Ship, Package, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <div className="flex space-x-2">
            <Link href="/admin/vessels">
              <Button 
                variant={location === "/admin/vessels" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Ship className="h-4 w-4" />
                Vessels
              </Button>
            </Link>
            <Link href="/admin/tracking">
              <Button 
                variant={location === "/admin/tracking" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Tracking Data
              </Button>
            </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}