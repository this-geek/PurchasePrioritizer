import { purchases, type Purchase, type InsertPurchase } from "@shared/schema";

export interface IStorage {
  getPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, purchase: Partial<InsertPurchase>): Promise<Purchase>;
  deletePurchase(id: number): Promise<void>;
  reorderPurchases(ids: number[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private purchases: Map<number, Purchase>;
  private currentId: number;

  constructor() {
    this.purchases = new Map();
    this.currentId = 1;
  }

  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).sort((a, b) => a.order - b.order);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentId++;
    const purchase: Purchase = { ...insertPurchase, id };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async updatePurchase(id: number, update: Partial<InsertPurchase>): Promise<Purchase> {
    const purchase = this.purchases.get(id);
    if (!purchase) throw new Error("Purchase not found");
    
    const updated = { ...purchase, ...update };
    this.purchases.set(id, updated);
    return updated;
  }

  async deletePurchase(id: number): Promise<void> {
    this.purchases.delete(id);
  }

  async reorderPurchases(ids: number[]): Promise<void> {
    ids.forEach((id, index) => {
      const purchase = this.purchases.get(id);
      if (purchase) {
        this.purchases.set(id, { ...purchase, order: index });
      }
    });
  }
}

export const storage = new MemStorage();
