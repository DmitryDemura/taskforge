import { ApiProperty } from '@nestjs/swagger';
import { TaskViewDto } from './task-view.dto';

export class PaginatedTasksDto {
  @ApiProperty({ type: [TaskViewDto] })
  tasks!: TaskViewDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}
