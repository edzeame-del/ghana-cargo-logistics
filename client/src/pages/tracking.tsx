import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Calendar, Anchor, Truck, Ship } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TrackingData = {
  id: number;
  trackingNumber: string;
  shippingMark: string;
  dateReceived: string;
  dateLoaded: string;
  quantity: string;
  cbm: string;
  eta: string;
  createdAt: string;
  updatedAt: string;
};

export default function Tracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await fetch(`/api/tracking/${searchTerm.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Tracking number not found. Please check your tracking number and try again.");
        } else {
          setError("Something went wrong. Please try again later.");
        }
        return;
      }

      const data = await response.json();
      setTrackingData(data);
    } catch (error) {
      setError("Unable to connect to tracking service. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getTrackingStatus = (data: TrackingData) => {
    if (data.eta && new Date(data.eta) < new Date()) {
      return { status: "Delivered", color: "bg-green-100 text-green-800" };
    } else if (data.dateLoaded) {
      return { status: "In Transit", color: "bg-blue-100 text-blue-800" };
    } else if (data.dateReceived) {
      return { status: "Processing", color: "bg-yellow-100 text-yellow-800" };
    }
    return { status: "Received", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Cargo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your full tracking number or just the last 6 digits to get real-time updates on your shipment
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Enter tracking number or last 6 digits"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isSearching} className="px-8">
                  {isSearching ? "Searching..." : "Track"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                You can search using the full tracking number or just the last 6 digits
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Status Header */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Tracking: {trackingData.trackingNumber}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getTrackingStatus(trackingData).color}>
                        {getTrackingStatus(trackingData).status}
                      </Badge>
                    </div>
                  </div>
                  <Package className="h-12 w-12 text-blue-500" />
                </div>
              </CardHeader>
            </Card>

            {/* Shipment Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    Shipment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Shipping Mark</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">{trackingData.shippingMark || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="mt-1 text-lg text-gray-900">{trackingData.quantity || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Volume (CBM)</dt>
                    <dd className="mt-1 text-lg text-gray-900">{trackingData.cbm || "N/A"}</dd>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {trackingData.dateReceived && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">Received</div>
                          <div className="text-sm text-gray-500">{formatDate(trackingData.dateReceived)}</div>
                        </div>
                      </div>
                    )}
                    {trackingData.dateLoaded && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">Loaded</div>
                          <div className="text-sm text-gray-500">{formatDate(trackingData.dateLoaded)}</div>
                        </div>
                      </div>
                    )}
                    {trackingData.eta && (
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${new Date(trackingData.eta) < new Date() ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(trackingData.eta) < new Date() ? 'Delivered' : 'Expected Arrival'}
                          </div>
                          <div className="text-sm text-gray-500">{formatDate(trackingData.eta)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Again */}
            <div className="text-center pt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setTrackingData(null);
                  setError(null);
                }}
              >
                Search Another Package
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!trackingData && !error && (
          <Card className="mt-12 shadow-lg">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Tracking Number Format</h3>
                  <p className="text-gray-600">
                    Your tracking number is usually provided when you ship your cargo. 
                    You can enter the full number or just the last 6 digits for convenience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Having Issues?</h3>
                  <p className="text-gray-600">
                    If you can't find your tracking information, please contact our customer 
                    service team with your shipping reference.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}