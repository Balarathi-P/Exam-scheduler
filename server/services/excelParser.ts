import * as XLSX from 'xlsx';

export async function parseExcelFile(buffer: Buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const subjects = jsonData.map((row: any) => {
      // Handle different possible column names
      const code = row['Subject Code'] || row['Code'] || row['subject_code'] || row['code'];
      const name = row['Subject Name'] || row['Name'] || row['subject_name'] || row['name'];
      const department = row['Department'] || row['Dept'] || row['department'] || row['dept'];
      const year = row['Year'] || row['year'];
      
      if (!code || !name || !department || !year) {
        throw new Error('Missing required fields: Subject Code, Subject Name, Department, Year');
      }
      
      return {
        code: String(code).trim(),
        name: String(name).trim(),
        department: String(department).trim().toUpperCase(),
        year: String(year).trim(),
      };
    });
    
    return subjects;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error('Failed to parse Excel file. Please check the format.');
  }
}
