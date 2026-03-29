import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RedisService } from './redis.service';
import { QrController } from './qr.controller';

@Module({
  controllers: [PaymentsController, QrController],
  providers: [PaymentsService, RedisService],
})
export class PaymentsModule {}
