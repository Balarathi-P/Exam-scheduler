import puppeteer from 'puppeteer';
import { Timetable, TimetableSubject, Subject } from '@shared/schema';

export async function generatePDF(
  timetable: Timetable, 
  timetableSubjects: (TimetableSubject & { subject: Subject })[]
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    const html = generateTimetableHTML(timetable, timetableSubjects);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function generateTimetableHTML(
  timetable: Timetable, 
  timetableSubjects: (TimetableSubject & { subject: Subject })[]
): string {
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
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        
        .header h2 {
          font-size: 14px;
          margin: 0 0 10px 0;
        }
        
        .header-info {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 11px;
        }
        
        .schedule-title {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin: 20px 0;
        }
        
        .timetable {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .timetable th,
        .timetable td {
          border: 1px solid #000;
          padding: 8px 4px;
          text-align: left;
          vertical-align: top;
          font-size: 10px;
        }
        
        .timetable th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        .date-column {
          width: 80px;
          font-weight: bold;
        }
        
        .subject-code {
          font-weight: bold;
          font-size: 9px;
        }
        
        .subject-name {
          font-size: 9px;
          color: #666;
        }
        
        .notes {
          margin-top: 30px;
          font-size: 10px;
        }
        
        .notes h4 {
          margin: 0 0 10px 0;
          font-size: 11px;
        }
        
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          text-align: center;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CHENNAI INSTITUTE OF TECHNOLOGY</h1>
        <p style="font-size: 12px; margin: 5px 0;">(Autonomous)</p>
        <p style="font-size: 12px; margin: 5px 0;">Autonomous Institution, Affiliated to Anna University, Chennai</p>
        <h2>OFFICE OF THE CONTROLLER OF EXAMINATIONS</h2>
        
        <div class="header-info">
          <span>REF: ${timetable.referenceNumber || 'CIT/COE/2025-26/ODD/04'}</span>
          <span>DATE: ${currentDate}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 14px;">CIRCULAR</h3>
        <p style="font-size: 11px; margin: 10px 0;">
          The ${timetable.examType} Exam for ${sortedDepartments.join(', ')} students starts from ${timetable.startDate} onwards. 
          All the students are hereby informing to take the exams seriously. 
          The marks secured in these tests will be considered for awarding the internal marks. 
          The schedule for the exams is as follows.
        </p>
      </div>
      
      <table class="timetable">
        <thead>
          <tr>
            <th class="date-column">DATE</th>
            ${sortedDepartments.map(dept => `<th>${dept}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${sortedDates.map(date => `
            <tr>
              <td class="date-column">${date}</td>
              ${sortedDepartments.map(dept => {
                const subjects = scheduleByDate[date][dept] || [];
                return `<td>
                  ${subjects.map(ts => `
                    <div class="subject-code">${ts.subject.code}</div>
                    <div class="subject-name">${ts.subject.name}</div>
                  `).join('')}
                </td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="notes">
        <h4>Note:</h4>
        <p>1. Exam Duration: ${timetable.examDuration}</p>
        <p>2. Students should be available inside the respective exam halls at 07:45 AM.</p>
        <p>3. Seating arrangement will be displayed in the notice board just before the day of first Exam.</p>
      </div>
      
      <div style="margin-top: 40px;">
        <p style="font-size: 10px; margin-bottom: 30px;">Copy To:</p>
        <p style="font-size: 10px;">1. The head of the department &nbsp;&nbsp; 2. To be read in all classes. &nbsp;&nbsp; 3. Main notice board &nbsp;&nbsp; 4. File copy.</p>
      </div>
      
      <div class="signature-section">
        <div class="signature-box" style="margin-top: 60px;">
          <div style="border-bottom: 1px solid #000; width: 200px; margin-bottom: 5px;"></div>
          <p><strong>Dr. A. PRINCIPAL, M.E., Ph.D.,</strong></p>
          <p>Principal</p>
          <p><strong>CHENNAI INSTITUTE OF TECHNOLOGY</strong></p>
          <p>(AUTONOMOUS)</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
