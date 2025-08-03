import { Subject } from "@shared/schema";

interface GenerateTimetableParams {
  subjects: Subject[];
  startDate: string;
  endDate: string;
  excludeSundays: boolean;
  excludeSaturdays: boolean;
}

interface ScheduleItem {
  subjectId: string;
  date: string;
  day: string;
  subject: Subject;
}

export function generateTimetable(params: GenerateTimetableParams): ScheduleItem[] {
  const { subjects, startDate, endDate, excludeSundays, excludeSaturdays } = params;
  
  // Generate available dates
  const availableDates = getAvailableDates(startDate, endDate, excludeSundays, excludeSaturdays);
  
  // Group subjects by name (same name subjects go on same date)
  const subjectsByName = groupSubjectsByName(subjects);
  
  // Assign dates to subject groups
  const schedule: ScheduleItem[] = [];
  let dateIndex = 0;
  
  for (const [subjectName, subjectGroup] of Object.entries(subjectsByName)) {
    if (dateIndex >= availableDates.length) {
      throw new Error("Not enough available dates for all subjects");
    }
    
    const examDate = availableDates[dateIndex];
    
    // All subjects with the same name get the same date
    for (const subject of subjectGroup) {
      schedule.push({
        subjectId: subject.id,
        date: examDate.date,
        day: examDate.day,
        subject,
      });
    }
    
    dateIndex++;
  }
  
  return schedule;
}

function getAvailableDates(startDate: string, endDate: string, excludeSundays: boolean, excludeSaturdays: boolean) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    // Skip if Sunday and excludeSundays is true
    if (excludeSundays && dayOfWeek === 0) continue;
    
    // Skip if Saturday and excludeSaturdays is true
    if (excludeSaturdays && dayOfWeek === 6) continue;
    
    dates.push({
      date: formatDate(new Date(date)),
      day: getDayName(dayOfWeek),
    });
  }
  
  return dates;
}

function groupSubjectsByName(subjects: Subject[]) {
  const grouped: { [key: string]: Subject[] } = {};
  
  for (const subject of subjects) {
    const normalizedName = subject.name.toLowerCase().trim();
    if (!grouped[normalizedName]) {
      grouped[normalizedName] = [];
    }
    grouped[normalizedName].push(subject);
  }
  
  return grouped;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}
