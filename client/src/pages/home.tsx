import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PurchaseForm from "@/components/purchase-form";
import PurchaseList from "@/components/purchase-list";
import { useQuery } from "@tanstack/react-query";
import type { Purchase } from "@shared/schema";

export default function Home() {
  const { data: purchases, isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const total = purchases?.reduce((sum, p) => sum + p.price, 0) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Purchase Planner</h1>
          <p className="text-muted-foreground">
            Track and prioritize your upcoming purchases
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[350px,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Add Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Purchase List</CardTitle>
              <div className="text-lg font-semibold">
                Total: ${(total / 100).toFixed(2)}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PurchaseList purchases={purchases || []} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
