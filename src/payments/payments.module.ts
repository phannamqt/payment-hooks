import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RedisService } from './redis.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, RedisService],
})
export class PaymentsModule {}
