import { Body, Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { SignupDTO } from './DTO/SignupDTO';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTO/LoginDTO';
import { Public } from './public.decorator';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('signup')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'Nguyen Van A' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'P@ssw0rd123' },
      },
    },
  })
  async signup(@Body() signupDTO: SignupDTO) {
    const user = await this.authService.signup(signupDTO);
    return user;
  }
  @Public()
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'P@ssw0rd123' },
      },
    },
  })
  async login(@Body() loginDTO: LoginDTO) {
    const result = await this.authService.login(loginDTO);
    return result;
  }
}
