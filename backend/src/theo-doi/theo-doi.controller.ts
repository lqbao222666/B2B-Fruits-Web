import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TheoDoiService } from './theo-doi.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';

@Controller('theo-doi')
@UseGuards(JwtAuthGuard)
export class TheoDoiController {
  constructor(private readonly theoDoiService: TheoDoiService) {}

  @Post('toggle/:seller_id')
  toggleTheoDoi(
    @Request() req,
    @Param('seller_id', ParseIntPipe) seller_id: number,
  ) {
    const buyer_id = req.user.user_id;
    return this.theoDoiService.toggleTheoDoi(buyer_id, seller_id);
  }

  @Get('status/:seller_id')
  getStatus(
    @Request() req,
    @Param('seller_id', ParseIntPipe) seller_id: number,
  ) {
    const buyer_id = req.user.user_id;
    return this.theoDoiService.getStatus(buyer_id, seller_id);
  }

  @Get('purchased-sellers')
  getPurchasedSellers(@Request() req) {
    const buyer_id = req.user.user_id;
    return this.theoDoiService.getPurchasedSellers(buyer_id);
  }
}
