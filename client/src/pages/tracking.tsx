import { useState, useEffect } from "react";
import VesselSearch from "@/components/tracking/vessel-search";
import VesselMap from "@/components/tracking/vessel-map";
import JourneyTimeline from "@/components/tracking/journey-timeline";
import VesselThumbnail from "@/components/tracking/vessel-thumbnail";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type Vessel = {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  trackingUrl: string;
  thumbnailUrl: string;
};

export default function Tracking() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [currentStage, setCurrentStage] = useState(0);

  // Fetch most recent vessel
  const { data: vessels } = useQuery<Vessel[]>({
    queryKey: ['vessels'],
    queryFn: async () => {
      const response = await fetch('/api/vessels');
      if (!response.ok) throw new Error('Failed to fetch vessels');
      return response.json();
    },
  });

  // Set the most recent vessel on initial load
  useEffect(() => {
    if (vessels && vessels.length > 0 && !selectedVessel) {
      setSelectedVessel(vessels[0]); // Most recent vessel will be first in the array
    }
  }, [vessels, selectedVessel]);

  // Demo function to advance the timeline
  const advanceStage = () => {
    setCurrentStage((prev) => (prev < 3 ? prev + 1 : 0));
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">Cargo Tracking</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Track your cargo journey and vessel location in real-time
          </p>
        </div>

        {/* Select Vessel to Track */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-6">Select Vessel to Track</h2>
          <div className="max-w-md mx-auto">
            <VesselSearch onVesselSelected={setSelectedVessel} />
          </div>
        </div>

        {/* Selected Vessel Display */}
        {selectedVessel && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Current Vessel</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <VesselThumbnail vessel={selectedVessel} />
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Vessel Details</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
                      <dd className="mt-1 text-lg text-gray-900">{selectedVessel.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
                      <dd className="mt-1 text-lg text-gray-900">{selectedVessel.imo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">MMSI</dt>
                      <dd className="mt-1 text-lg text-gray-900">{selectedVessel.mmsi}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                      <dd className="mt-1">
                        <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Journey Timeline */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Journey Status</h3>
                  <JourneyTimeline currentStage={currentStage} />
                  <div className="mt-4 text-center">
                    <Button onClick={advanceStage} size="sm">
                      Update Status (Demo)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Vessel Location</h2>
          <VesselMap vessel={selectedVessel} />
        </div>
      </div>
    </div>
  );
}