import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  NotFoundException,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          exceptionFactory: (error) => {
            if (error.includes('file size')) {
              return new PayloadTooLargeException('File is too large (max 5MB)');
            }
            return error;
          },
        }),
    )
    file: Express.Multer.File,
  ) {
    const fileUrl = this.fileService.getFileUrl(file.filename);

    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
    };
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    // Check if file exists
    if (!(await this.fileService.fileExists(filename))) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    // Return the file
    return res.sendFile(filename, { root: this.configService.get<string>('UPLOAD_DIR') || './uploads' });
  }

  @Delete(':filename')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('filename') filename: string) {
    await this.fileService.deleteFile(filename);
  }
}
