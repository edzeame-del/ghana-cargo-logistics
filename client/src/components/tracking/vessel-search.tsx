import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

type Vessel = {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  trackingUrl: string;
  thumbnailUrl: string;
};

type VesselSearchProps = {
  onVesselSelected: (vessel: Vessel) => void;
};

export default function VesselSearch({ onVesselSelected }: VesselSearchProps) {
  const { data: vessels, isLoading, error } = useQuery<Vessel[]>({
    queryKey: ['vessels'],
    queryFn: async () => {
      const response = await fetch('/api/vessels');
      if (!response.ok) throw new Error('Failed to fetch vessels');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading vessels...</div>;
  if (error) return <div>Error loading vessels</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Vessel</h3>
      <Select onValueChange={(value) => {
        const vessel = vessels?.find(v => v.id.toString() === value);
        if (vessel) onVesselSelected(vessel);
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a vessel to track" />
        </SelectTrigger>
        <SelectContent>
          {vessels?.map((vessel) => (
            <SelectItem key={vessel.id} value={vessel.id.toString()}>
              {vessel.name} (IMO: {vessel.imo})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}