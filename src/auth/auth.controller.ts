import { Body, Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { SignupDTO } from './DTO/SignupDTO';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDTO: SignupDTO) {
    const user = await this.authService.signup(signupDTO);
    return user;
  }
}
