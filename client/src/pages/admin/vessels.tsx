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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function VesselsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [trackingUrl, setTrackingUrl] = useState("");
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
      setTrackingUrl("");
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

  const deleteVesselMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/vessels/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vessel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      toast({
        title: "Success",
        description: "Vessel deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete vessel",
        variant: "destructive",
      });
    },
  });

  const extractVesselInfo = async (url: string) => {
    try {
      const response = await fetch('/api/vessels/extract-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to extract vessel information');

      const data = await response.json();
      setNewVessel(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract vessel information from URL",
        variant: "destructive",
      });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setTrackingUrl(url);
    if (url.includes('marinetraffic.com')) {
      extractVesselInfo(url);
    }
  };

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
          <CardDescription>Enter MarineTraffic URL to auto-populate vessel details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="MarineTraffic URL"
              value={trackingUrl}
              onChange={handleUrlChange}
            />
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
              placeholder="Thumbnail URL (Optional - will be auto-populated from MarineTraffic)"
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(vessel.trackingUrl, '_blank')}
                      >
                        View Tracking
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Vessel</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {vessel.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteVesselMutation.mutate(vessel.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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