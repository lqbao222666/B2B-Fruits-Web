import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // Đọc role từ query parameters (ví dụ: ?role=doanh_nghiep)
    // Nếu không có, mặc định là nong_dan
    const role = req.query.role || 'nong_dan';
    
    return {
      state: role,
    };
  }
}
