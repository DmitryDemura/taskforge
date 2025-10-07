import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../task-status.enum';

export class TaskViewDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Plan project structure' })
  title!: string;

  @ApiProperty({ required: false, nullable: true, example: 'Define modules' })
  description?: string | null;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.todo })
  status!: TaskStatus;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2025-01-31T00:00:00.000Z',
  })
  dueDate?: string | null;
}
