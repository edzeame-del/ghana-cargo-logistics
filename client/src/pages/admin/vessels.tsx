import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VesselsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newVessel, setNewVessel] = useState({
    name: "",
    imo: "",
    mmsi: "",
    trackingUrl: "",
    thumbnailUrl: "",
  });

  const { data: vessels, isLoading } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const response = await fetch('/api/vessels');
      if (!response.ok) throw new Error('Failed to fetch vessels');
      return response.json();
    },
  });

  const addVesselMutation = useMutation({
    mutationFn: async (vessel: typeof newVessel) => {
      const response = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vessel),
      });
      if (!response.ok) throw new Error('Failed to add vessel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      setNewVessel({
        name: "",
        imo: "",
        mmsi: "",
        trackingUrl: "",
        thumbnailUrl: "",
      });
      toast({
        title: "Success",
        description: "Vessel added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vessel",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVesselMutation.mutate(newVessel);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Manage Vessels</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Vessel</CardTitle>
          <CardDescription>Enter vessel details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Vessel Name"
              value={newVessel.name}
              onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
            />
            <Input
              placeholder="IMO Number"
              value={newVessel.imo}
              onChange={(e) => setNewVessel({ ...newVessel, imo: e.target.value })}
            />
            <Input
              placeholder="MMSI Number"
              value={newVessel.mmsi}
              onChange={(e) => setNewVessel({ ...newVessel, mmsi: e.target.value })}
            />
            <Input
              placeholder="Tracking URL"
              value={newVessel.trackingUrl}
              onChange={(e) => setNewVessel({ ...newVessel, trackingUrl: e.target.value })}
            />
            <Input
              placeholder="Thumbnail URL"
              value={newVessel.thumbnailUrl}
              onChange={(e) => setNewVessel({ ...newVessel, thumbnailUrl: e.target.value })}
            />
            <Button type="submit" disabled={addVesselMutation.isPending}>
              {addVesselMutation.isPending ? "Adding..." : "Add Vessel"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Existing Vessels</h2>
        {isLoading ? (
          <div>Loading vessels...</div>
        ) : (
          <div className="grid gap-4">
            {vessels?.map((vessel: any) => (
              <Card key={vessel.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{vessel.name}</h3>
                      <p className="text-sm text-gray-500">IMO: {vessel.imo}</p>
                      <p className="text-sm text-gray-500">MMSI: {vessel.mmsi}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open(vessel.trackingUrl, '_blank')}
                    >
                      View Tracking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
