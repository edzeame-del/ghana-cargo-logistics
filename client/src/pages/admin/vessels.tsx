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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Edit2 } from "lucide-react";

export default function VesselsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [trackingUrl, setTrackingUrl] = useState("");
  const [editingVessel, setEditingVessel] = useState<null | any>(null);
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

  const updateVesselMutation = useMutation({
    mutationFn: async (vessel: any) => {
      const { id, ...data } = vessel;
      const response = await fetch(`/api/vessels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vessel');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      setEditingVessel(null);
      toast({
        title: "Success",
        description: "Vessel updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vessel",
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
      if (editingVessel) {
        setEditingVessel({ ...editingVessel, ...data });
      } else {
        setNewVessel(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract vessel information from URL",
        variant: "destructive",
      });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const url = e.target.value;
    if (url.includes('marinetraffic.com')) {
      extractVesselInfo(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVesselMutation.mutate(newVessel);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVessel) {
      updateVesselMutation.mutate(editingVessel);
    }
  };

  const VesselForm = ({ data, onChange, onSubmit, submitText, isEditing = false }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        placeholder="MarineTraffic URL"
        value={data.trackingUrl || ""}
        onChange={(e) => {
          onChange({ ...data, trackingUrl: e.target.value });
          if (!isEditing) {
            handleUrlChange(e);
          }
        }}
      />
      <Input
        placeholder="Vessel Name"
        value={data.name || ""}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />
      <Input
        placeholder="IMO Number"
        value={data.imo || ""}
        onChange={(e) => onChange({ ...data, imo: e.target.value })}
      />
      <Input
        placeholder="MMSI Number"
        value={data.mmsi || ""}
        onChange={(e) => onChange({ ...data, mmsi: e.target.value })}
      />
      <Input
        placeholder="Thumbnail URL"
        value={data.thumbnailUrl || ""}
        onChange={(e) => onChange({ ...data, thumbnailUrl: e.target.value })}
      />
      <Button type="submit" disabled={!data.name || !data.imo || !data.mmsi}>
        {submitText}
      </Button>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Manage Vessels</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Vessel</CardTitle>
          <CardDescription>Enter MarineTraffic URL to auto-populate vessel details</CardDescription>
        </CardHeader>
        <CardContent>
          <VesselForm
            data={newVessel}
            onChange={setNewVessel}
            onSubmit={handleSubmit}
            submitText={addVesselMutation.isPending ? "Adding..." : "Add Vessel"}
          />
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

                      <Dialog onOpenChange={(open) => {
                        if (open) {
                          setEditingVessel({ ...vessel });
                        } else {
                          setEditingVessel(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Vessel</DialogTitle>
                            <DialogDescription>
                              Update the vessel information below
                            </DialogDescription>
                          </DialogHeader>
                          {editingVessel && (
                            <VesselForm
                              data={editingVessel}
                              onChange={setEditingVessel}
                              onSubmit={handleUpdate}
                              submitText={updateVesselMutation.isPending ? "Updating..." : "Update Vessel"}
                              isEditing={true}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

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