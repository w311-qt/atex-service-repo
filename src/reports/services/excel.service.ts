import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async generateExcel(data: any[], headers: string[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    worksheet.columns.forEach((column) => {
      if (column && column.eachCell) {
        column.eachCell({ includeEmpty: false }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });

    worksheet.columns.forEach((column) => {
      if (column && column.width) {
        let maxLength = 0;
        if (column.values) {
          column.values.forEach((value) => {
            if (value) {
              const length = value.toString().length;
              if (length > maxLength) {
                maxLength = length;
              }
            }
          });
        }
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      }
    });

    const buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
    return buffer;
  }
}
