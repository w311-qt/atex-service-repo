import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  /**
   * Generate Excel file with multiple worksheets
   * @param worksheets Array of worksheet data
   * @returns Buffer containing Excel file
   */
  async generateExcel(worksheets: { name: string; data: any[][] }[]): Promise<Buffer> {
    // Create a new workbook and add worksheets
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'АТЭКС-Электро';
    workbook.created = new Date();

    // Add each worksheet
    for (const worksheetData of worksheets) {
      const worksheet = workbook.addWorksheet(worksheetData.name);

      // Add rows
      worksheet.addRows(worksheetData.data);

      // Style header rows
      const titleRow = worksheet.getRow(1);
      titleRow.font = { size: 16, bold: true };

      // Find separator rows (null cells) and format headers
      let inHeader = true;
      for (let i = 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const firstCell = row.getCell(1).value;

        if (firstCell === null) {
          inHeader = true;
          continue;
        }

        if (inHeader && i > 1) {
          if (
            typeof firstCell === 'string' &&
            (firstCell.includes('By ') ||
              firstCell === 'Status' ||
              firstCell === 'Category' ||
              firstCell === 'Type' ||
              firstCell === 'Technician' ||
              firstCell === 'Age Group' ||
              firstCell === 'Month')
          ) {
            row.font = { bold: true };
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0E0E0' },
            };
            inHeader = false;
          }
        }
      }

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        if (column) {
          // Check if column is defined
          let maxLength = 0;
          column.eachCell({ includeEmpty: false }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 10;
            maxLength = Math.max(maxLength, cellLength);
          });
          column.width = Math.min(maxLength + 2, 50);
        }
      });
    }

    // Write to buffer
    const buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
    return buffer;
  }
}
