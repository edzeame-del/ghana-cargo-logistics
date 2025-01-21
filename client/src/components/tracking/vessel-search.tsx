import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

const searchSchema = z.object({
  vesselName: z.string().min(3, "Vessel name must be at least 3 characters"),
});

type VesselSearchProps = {
  onVesselFound: (vesselData: any) => void;
};

export default function VesselSearch({ onVesselFound }: VesselSearchProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      vesselName: "",
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (vesselName: string) => {
      const response = await fetch(`/api/vessel/search?name=${encodeURIComponent(vesselName)}`);
      if (!response.ok) {
        throw new Error("Failed to find vessel");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setError(null);
      onVesselFound(data);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to search vessel");
    },
  });

  function onSubmit(values: z.infer<typeof searchSchema>) {
    searchMutation.mutate(values.vesselName);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vesselName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter vessel name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button 
          type="submit" 
          className="w-full"
          disabled={searchMutation.isPending}
        >
          {searchMutation.isPending ? "Searching..." : "Track Vessel"}
        </Button>
      </form>
    </Form>
  );
}
