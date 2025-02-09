import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  app.get("/api/purchases", async (_req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      const purchase = insertPurchaseSchema.parse(req.body);
      const created = await storage.createPurchase(purchase);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/purchases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const update = insertPurchaseSchema.partial().parse(req.body);
      const updated = await storage.updatePurchase(id, update);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/purchases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePurchase(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/purchases/reorder", async (req, res) => {
    try {
      const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
      await storage.reorderPurchases(ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return createServer(app);
}
