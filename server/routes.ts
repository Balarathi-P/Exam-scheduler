import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubjectSchema, insertTimetableSchema } from "@shared/schema";
import { generateTimetable } from "./services/timetableGenerator";
import { generatePDF } from "./services/pdfGenerator";
import { parseExcelFile } from "./services/excelParser";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid subject data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create subject" });
      }
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      await storage.deleteSubject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

  app.post("/api/subjects/bulk-import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const subjects = await parseExcelFile(req.file.buffer);
      const createdSubjects = await storage.createMultipleSubjects(subjects);
      res.json(createdSubjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to import subjects from file" });
    }
  });

  // Timetable routes
  app.post("/api/timetables", async (req, res) => {
    try {
      const validatedData = insertTimetableSchema.parse(req.body);
      const timetable = await storage.createTimetable(validatedData);
      res.json(timetable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid timetable data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create timetable" });
      }
    }
  });

  app.get("/api/timetables", async (req, res) => {
    try {
      const timetables = await storage.getTimetables();
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timetables" });
    }
  });

  app.get("/api/timetables/:id", async (req, res) => {
    try {
      const timetable = await storage.getTimetable(req.params.id);
      if (!timetable) {
        return res.status(404).json({ error: "Timetable not found" });
      }
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timetable" });
    }
  });

  app.get("/api/timetables/:id/subjects", async (req, res) => {
    try {
      const timetableSubjects = await storage.getTimetableSubjects(req.params.id);
      res.json(timetableSubjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timetable subjects" });
    }
  });

  app.post("/api/timetables/generate", async (req, res) => {
    try {
      const { 
        selectedSubjects,
        startDate,
        endDate,
        excludeSundays,
        excludeSaturdays,
        ...timetableData 
      } = req.body;

      // Create timetable record
      const timetable = await storage.createTimetable({
        ...timetableData,
        startDate,
        endDate,
        excludeSundays: excludeSundays || true,
        excludeSaturdays: excludeSaturdays || false,
      });

      // Generate schedule
      const schedule = generateTimetable({
        subjects: selectedSubjects,
        startDate,
        endDate,
        excludeSundays: excludeSundays || true,
        excludeSaturdays: excludeSaturdays || false,
      });

      // Save timetable subjects
      const timetableSubjects = schedule.map(item => ({
        timetableId: timetable.id,
        subjectId: item.subjectId,
        examDate: item.date,
        day: item.day,
      }));

      await storage.createMultipleTimetableSubjects(timetableSubjects);

      // Update timetable with schedule
      const updatedTimetable = await storage.getTimetable(timetable.id);
      
      res.json({
        timetable: updatedTimetable,
        schedule,
      });
    } catch (error) {
      console.error("Timetable generation error:", error);
      res.status(500).json({ error: "Failed to generate timetable" });
    }
  });

  app.get("/api/timetables/:id/pdf", async (req, res) => {
    try {
      const timetable = await storage.getTimetable(req.params.id);
      if (!timetable) {
        return res.status(404).json({ error: "Timetable not found" });
      }

      const timetableSubjects = await storage.getTimetableSubjects(req.params.id);
      const pdfBuffer = await generatePDF(timetable, timetableSubjects);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="timetable-${timetable.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
