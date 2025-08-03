import PDFDocument from 'pdfkit';
import { Timetable, TimetableSubject, Subject } from '@shared/schema';

export async function generatePDF(
  timetable: Timetable, 
  timetableSubjects: (TimetableSubject & { subject: Subject })[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generate the PDF content
      generatePDFContent(doc, timetable, timetableSubjects);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generatePDFContent(
  doc: any,
  timetable: Timetable, 
  timetableSubjects: (TimetableSubject & { subject: Subject })[]
) {
  // Group subjects by date and department
  const scheduleByDate: { [date: string]: { [dept: string]: (TimetableSubject & { subject: Subject })[] } } = {};
  const departments = new Set<string>();
  
  timetableSubjects.forEach(ts => {
    if (!scheduleByDate[ts.examDate]) {
      scheduleByDate[ts.examDate] = {};
    }
    if (!scheduleByDate[ts.examDate][ts.subject.department]) {
      scheduleByDate[ts.examDate][ts.subject.department] = [];
    }
    scheduleByDate[ts.examDate][ts.subject.department].push(ts);
    departments.add(ts.subject.department);
  });
  
  const sortedDates = Object.keys(scheduleByDate).sort();
  const sortedDepartments = Array.from(departments).sort();
  const currentDate = new Date().toLocaleDateString('en-GB');

  let yPosition = 80;
  
  // Header - University Name
  doc.fontSize(16).font('Helvetica-Bold');
  doc.text('CHENNAI INSTITUTE OF TECHNOLOGY', 0, yPosition, { align: 'center' });
  yPosition += 20;
  
  doc.fontSize(12).font('Helvetica');
  doc.text('(Autonomous)', 0, yPosition, { align: 'center' });
  yPosition += 15;
  
  doc.fontSize(10);
  doc.text('Autonomous Institution, Affiliated to Anna University, Chennai', 0, yPosition, { align: 'center' });
  yPosition += 25;
  
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', 0, yPosition, { align: 'center' });
  yPosition += 30;
  
  // Reference and Date
  doc.fontSize(10).font('Helvetica');
  doc.text(`REF: ${timetable.referenceNumber || 'CIT/COE/2025-26/ODD/04'}`, 50, yPosition);
  doc.text(`DATE: ${currentDate}`, 450, yPosition);
  yPosition += 30;
  
  // Draw line
  doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
  yPosition += 30;
  
  // CIRCULAR title
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('CIRCULAR', 0, yPosition, { align: 'center' });
  yPosition += 25;
  
  // Circular content
  doc.fontSize(10).font('Helvetica');
  const circularText = `The ${timetable.examType} Exam for ${sortedDepartments.join(', ')} students starts from ${timetable.startDate} onwards. All the students are hereby informing to take the exams seriously. The marks secured in these tests will be considered for awarding the internal marks. The schedule for the exams is as follows.`;
  doc.text(circularText, 50, yPosition, { width: 495, align: 'justify' });
  yPosition += 50;
  
  // Table
  const tableStartY = yPosition;
  const tableWidth = 495;
  const colWidth = tableWidth / (sortedDepartments.length + 1);
  const rowHeight = 25;
  
  // Table header
  doc.fontSize(10).font('Helvetica-Bold');
  
  // Header row
  doc.rect(50, yPosition, colWidth, rowHeight).stroke();
  doc.text('DATE', 50 + 5, yPosition + 8, { width: colWidth - 10, align: 'center' });
  
  sortedDepartments.forEach((dept, index) => {
    const x = 50 + (index + 1) * colWidth;
    doc.rect(x, yPosition, colWidth, rowHeight).stroke();
    doc.text(dept, x + 5, yPosition + 8, { width: colWidth - 10, align: 'center' });
  });
  
  yPosition += rowHeight;
  
  // Data rows
  doc.font('Helvetica');
  sortedDates.forEach(date => {
    const startY = yPosition;
    
    // Date column
    doc.rect(50, yPosition, colWidth, rowHeight).stroke();
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(date, 50 + 5, yPosition + 8, { width: colWidth - 10, align: 'center' });
    
    // Department columns
    sortedDepartments.forEach((dept, index) => {
      const x = 50 + (index + 1) * colWidth;
      doc.rect(x, yPosition, colWidth, rowHeight).stroke();
      
      const subjects = scheduleByDate[date]?.[dept] || [];
      let subjectY = yPosition + 5;
      
      subjects.forEach(ts => {
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text(ts.subject.code, x + 3, subjectY, { width: colWidth - 6 });
        subjectY += 10;
        doc.fontSize(7).font('Helvetica');
        doc.text(ts.subject.name, x + 3, subjectY, { width: colWidth - 6 });
        subjectY += 12;
      });
    });
    
    yPosition += rowHeight;
  });
  
  yPosition += 30;
  
  // Notes
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Note:', 50, yPosition);
  yPosition += 15;
  
  doc.fontSize(9).font('Helvetica');
  doc.text(`1. Exam Duration: ${timetable.examDuration}`, 50, yPosition);
  yPosition += 12;
  doc.text('2. Students should be available inside the respective exam halls at 07:45 AM.', 50, yPosition);
  yPosition += 12;
  doc.text('3. Seating arrangement will be displayed in the notice board just before the day of first Exam.', 50, yPosition);
  yPosition += 30;
  
  // Copy To
  doc.text('Copy To:', 50, yPosition);
  yPosition += 15;
  doc.text('1. The head of the department    2. To be read in all classes.    3. Main notice board    4. File copy.', 50, yPosition);
  yPosition += 60;
  
  // Signature
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Dr. A. PRINCIPAL, M.E., Ph.D.,', 400, yPosition);
  yPosition += 12;
  doc.text('Principal', 400, yPosition);
  yPosition += 12;
  doc.text('CHENNAI INSTITUTE OF TECHNOLOGY', 400, yPosition);
  yPosition += 12;
  doc.text('(AUTONOMOUS)', 400, yPosition);
}
