import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@shared/queue';

@Processor(QUEUE_NAMES.STORAGE)
export class ProcessImageProcessor extends WorkerHost {
  private readonly logger = new Logger(ProcessImageProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing image: ${job.data.filename}`);
    this.logger.log(`Image processed: ${job.data.filename}`);
  }
}
