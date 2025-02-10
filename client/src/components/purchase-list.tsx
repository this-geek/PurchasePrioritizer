import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, ExternalLink } from "lucide-react";
import type { Purchase } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EditPurchaseDialog from "./edit-purchase-dialog";

interface PurchaseListProps {
  purchases: Purchase[];
}

export default function PurchaseList({ purchases }: PurchaseListProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/purchases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await apiRequest("POST", "/api/purchases/reorder", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(purchases);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderMutation.mutate(items.map((item) => item.id));
  };

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No purchases yet. Add one to get started!
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="purchases">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {purchases.map((purchase, index) => (
              <Draggable
                key={purchase.id}
                draggableId={purchase.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <Card className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="font-medium truncate">
                              {purchase.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                ${(purchase.price / 100).toFixed(2)}
                              </span>
                              {purchase.link && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                >
                                  <a
                                    href={purchase.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <EditPurchaseDialog purchase={purchase} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMutation.mutate(purchase.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}