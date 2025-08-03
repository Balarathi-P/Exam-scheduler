import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull(),
  name: text("name").notNull(),
  department: varchar("department", { length: 10 }).notNull(),
  year: varchar("year", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timetables = pgTable("timetables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  semester: varchar("semester", { length: 20 }).notNull(),
  examType: varchar("exam_type", { length: 50 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 50 }),
  startDate: varchar("start_date", { length: 20 }).notNull(),
  endDate: varchar("end_date", { length: 20 }).notNull(),
  examDuration: varchar("exam_duration", { length: 50 }).notNull(),
  excludeSundays: boolean("exclude_sundays").default(true),
  excludeSaturdays: boolean("exclude_saturdays").default(false),
  schedule: jsonb("schedule"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timetableSubjects = pgTable("timetable_subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timetableId: varchar("timetable_id").notNull().references(() => timetables.id),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  examDate: varchar("exam_date", { length: 20 }).notNull(),
  day: varchar("day", { length: 10 }).notNull(),
});

export const timetableRelations = relations(timetables, ({ many }) => ({
  timetableSubjects: many(timetableSubjects),
}));

export const timetableSubjectsRelations = relations(timetableSubjects, ({ one }) => ({
  timetable: one(timetables, {
    fields: [timetableSubjects.timetableId],
    references: [timetables.id],
  }),
  subject: one(subjects, {
    fields: [timetableSubjects.subjectId],
    references: [subjects.id],
  }),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  timetableSubjects: many(timetableSubjects),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetables).omit({
  id: true,
  createdAt: true,
});

export const insertTimetableSubjectSchema = createInsertSchema(timetableSubjects).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetableSubject = z.infer<typeof insertTimetableSubjectSchema>;
export type TimetableSubject = typeof timetableSubjects.$inferSelect;
