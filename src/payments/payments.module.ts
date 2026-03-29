import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RedisService } from './redis.service';
import { QrController } from './qr.controller';
import { QrImageService } from './qr-image.service';
import { PaymentsGateway } from './payments.gateway';

@Module({
  controllers: [PaymentsController, QrController],
  providers: [PaymentsService, RedisService, QrImageService, PaymentsGateway],
})
export class PaymentsModule {}
