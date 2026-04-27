import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@shared/queue';

@Processor(QUEUE_NAMES.EMAIL)
export class SendWelcomeEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(SendWelcomeEmailProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    this.logger.log(`Welcome email sent to user ${job.data.userId} at ${job.data.email}`);
  }
}
