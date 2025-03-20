import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true, // Remove non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      forbidUnknownValues: true, // Reject unknown values
    });

    if (errors.length > 0) {
      const formattedErrors = errors.map((err) => {
        const constraints = err.constraints ? Object.values(err.constraints) : [];
        return {
          property: err.property,
          errors: constraints,
          children: err.children?.length ? this.formatChildren(err.children) : undefined,
        };
      });

      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private formatChildren(children: any[]): any[] {
    return children.map((child) => {
      const constraints = child.constraints ? Object.values(child.constraints) : [];
      return {
        property: child.property,
        errors: constraints,
        children: child.children?.length ? this.formatChildren(child.children) : undefined,
      };
    });
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
