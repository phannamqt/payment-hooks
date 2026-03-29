import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RedisService } from './redis.service';
import { QrController } from './qr.controller';
import { QrImageService } from './qr-image.service';

@Module({
  controllers: [PaymentsController, QrController],
  providers: [PaymentsService, RedisService, QrImageService],
})
export class PaymentsModule {}
