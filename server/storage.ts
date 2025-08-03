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
import { eq, and, inArray, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSubject(subject: InsertSubject): Promise<Subject>;
  getSubjects(department?: string, year?: string): Promise<Subject[]>;
  deleteSubject(id: string): Promise<void>;
  createMultipleSubjects(subjects: InsertSubject[]): Promise<Subject[]>;
  getDepartments(): Promise<string[]>;
  getSubjectStats(): Promise<{ department: string; year: string; count: number }[]>;
  
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

  async getSubjects(department?: string, year?: string): Promise<Subject[]> {
    let query = db.select().from(subjects);
    
    if (department && year) {
      query = query.where(and(eq(subjects.department, department), eq(subjects.year, year)));
    } else if (department) {
      query = query.where(eq(subjects.department, department));
    } else if (year) {
      query = query.where(eq(subjects.year, year));
    }
    
    return await query.orderBy(subjects.department, subjects.year, subjects.code);
  }

  async getDepartments(): Promise<string[]> {
    const result = await db
      .selectDistinct({ department: subjects.department })
      .from(subjects)
      .orderBy(subjects.department);
    return result.map(r => r.department);
  }

  async getSubjectStats(): Promise<{ department: string; year: string; count: number }[]> {
    const result = await db
      .select({
        department: subjects.department,
        year: subjects.year,
        count: sql<number>`count(*)`
      })
      .from(subjects)
      .groupBy(subjects.department, subjects.year)
      .orderBy(subjects.department, subjects.year);
    return result;
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
