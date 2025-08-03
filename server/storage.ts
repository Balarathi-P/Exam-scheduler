import { 
  users, 
  subjects,
  timetables,
  timetableSubjects,
  type User, 
  type InsertUser,
  type Subject,
  type InsertSubject,
  type Timetable,
  type InsertTimetable,
  type TimetableSubject,
  type InsertTimetableSubject
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSubject(subject: InsertSubject): Promise<Subject>;
  getSubjects(): Promise<Subject[]>;
  deleteSubject(id: string): Promise<void>;
  createMultipleSubjects(subjects: InsertSubject[]): Promise<Subject[]>;
  
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;
  getTimetable(id: string): Promise<Timetable | undefined>;
  getTimetables(): Promise<Timetable[]>;
  
  createTimetableSubject(timetableSubject: InsertTimetableSubject): Promise<TimetableSubject>;
  getTimetableSubjects(timetableId: string): Promise<(TimetableSubject & { subject: Subject })[]>;
  createMultipleTimetableSubjects(timetableSubjects: InsertTimetableSubject[]): Promise<TimetableSubject[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db
      .insert(subjects)
      .values(subject)
      .returning();
    return newSubject;
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  async createMultipleSubjects(subjectList: InsertSubject[]): Promise<Subject[]> {
    return await db
      .insert(subjects)
      .values(subjectList)
      .returning();
  }

  async createTimetable(timetable: InsertTimetable): Promise<Timetable> {
    const [newTimetable] = await db
      .insert(timetables)
      .values(timetable)
      .returning();
    return newTimetable;
  }

  async getTimetable(id: string): Promise<Timetable | undefined> {
    const [timetable] = await db.select().from(timetables).where(eq(timetables.id, id));
    return timetable || undefined;
  }

  async getTimetables(): Promise<Timetable[]> {
    return await db.select().from(timetables);
  }

  async createTimetableSubject(timetableSubject: InsertTimetableSubject): Promise<TimetableSubject> {
    const [newTimetableSubject] = await db
      .insert(timetableSubjects)
      .values(timetableSubject)
      .returning();
    return newTimetableSubject;
  }

  async getTimetableSubjects(timetableId: string): Promise<(TimetableSubject & { subject: Subject })[]> {
    return await db
      .select({
        id: timetableSubjects.id,
        timetableId: timetableSubjects.timetableId,
        subjectId: timetableSubjects.subjectId,
        examDate: timetableSubjects.examDate,
        day: timetableSubjects.day,
        subject: subjects,
      })
      .from(timetableSubjects)
      .innerJoin(subjects, eq(timetableSubjects.subjectId, subjects.id))
      .where(eq(timetableSubjects.timetableId, timetableId));
  }

  async createMultipleTimetableSubjects(timetableSubjectList: InsertTimetableSubject[]): Promise<TimetableSubject[]> {
    return await db
      .insert(timetableSubjects)
      .values(timetableSubjectList)
      .returning();
  }
}

export const storage = new DatabaseStorage();
