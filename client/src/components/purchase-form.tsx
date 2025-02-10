import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseSchema, type InsertPurchase, type Purchase } from "@shared/schema";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PurchaseForm() {
  const { toast } = useToast();
  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const form = useForm<InsertPurchase>({
    resolver: zodResolver(insertPurchaseSchema),
    defaultValues: {
      name: "",
      price: 0,
      link: "",
      order: purchases.length, // Set order to current list length
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertPurchase) => {
      const formattedData = {
        ...data,
        price: Math.round(data.price * 100), // Convert to cents
      };
      const res = await apiRequest("POST", "/api/purchases", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      form.reset();
      toast({
        title: "Success",
        description: "Purchase added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="New laptop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="999.99"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Adding..." : "Add Purchase"}
        </Button>
      </form>
    </Form>
  );
}