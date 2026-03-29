import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiKeyGuard } from './api-key.guard';

@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('hooks/sepay-payment')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  async receiveHook(@Body() body: any) {
    this.logger.log(`Received webhook: ${JSON.stringify(body)}`);
    const payment = await this.paymentsService.savePayment(body);
    return { success: true, payment };
  }

  @Get('api/payments')
  async getPayments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.paymentsService.getPayments(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
    return result;
  }

  @Delete('api/payments')
  @HttpCode(HttpStatus.OK)
  async clearPayments(@Body('password') password: string) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && password !== adminPassword) {
      throw new UnauthorizedException('Sai mật khẩu');
    }
    await this.paymentsService.clearPayments();
    return { success: true, message: 'All payments cleared' };
  }
}
