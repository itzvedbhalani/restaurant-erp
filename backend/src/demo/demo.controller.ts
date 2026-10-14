import { Controller, Post, Body } from '@nestjs/common';
import { DemoService } from './demo.service';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiTags, ApiOperation } from '@nestjs/swagger';

class QuickLoginDto {
  @ApiProperty({ example: 'a-random-id-generated-and-stored-in-the-browser' })
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiProperty({ example: 'OWNER', description: 'OWNER, WAITER, CASHIER, or KITCHEN' })
  @IsNotEmpty()
  @IsString()
  roleName: string;
}

@ApiTags('Demo / Quick Login')
@Controller('demo')
export class DemoController {
  constructor(private demoService: DemoService) {}

  @Post('quick-login')
  @ApiOperation({
    summary:
      'Public, no-auth-required quick login into an isolated, temporary demo restaurant. 5 minute session, one fresh demo per device+role every 3 days.',
  })
  async quickLogin(@Body() dto: QuickLoginDto) {
    return this.demoService.quickLogin(dto.deviceId, dto.roleName);
  }
}
