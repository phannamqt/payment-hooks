import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const apiKey = process.env.WEBHOOK_API_KEY;

    // Nếu chưa cấu hình key thì bỏ qua xác thực
    if (!apiKey) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'] ?? '';

    // SePay gửi: Authorization: Apikey <key>
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() === 'apikey' && token === apiKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
