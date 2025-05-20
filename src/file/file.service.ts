import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Get the full path to the uploaded file
   */
  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  /**
   * Get the URL for accessing the file
   */
  getFileUrl(filename: string): string {
    const apiPrefix = this.configService.get<string>('API_PREFIX') || 'api';
    return `/${apiPrefix}/files/${filename}`;
  }

  /**
   * Check if a file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      await fs.promises.access(this.getFilePath(filename), fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filename: string): Promise<void> {
    const filePath = this.getFilePath(filename);

    if (!(await this.fileExists(filename))) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    try {
      await fs.promises.unlink(filePath);
      this.logger.log(`Deleted file: ${filename}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${filename}: ${error.message}`);
      throw error;
    }
  }
}
