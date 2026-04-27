import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@shared/database';

@Processor('audit')
export class AuditLogProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { userId, action, entity, entityId, changes, timestamp } = job.data;

    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes || {},
        createdAt: new Date(timestamp),
      },
    });
  }
}
