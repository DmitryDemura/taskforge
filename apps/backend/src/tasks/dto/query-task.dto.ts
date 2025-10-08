import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TaskStatus } from '@prisma/client';

export class QueryTaskDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === 'all') {
      return undefined;
    }

    return value;
  })
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsIn(['title', 'status', 'dueDate', 'createdAt'])
  sortField?: 'title' | 'status' | 'dueDate' | 'createdAt';

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsString()
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @IsString()
  dueDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number;
}
