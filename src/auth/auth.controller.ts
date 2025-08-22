import { Body, Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { SignupDTO } from './DTO/SignupDTO';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTO/LoginDTO';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('signup')
  async signup(@Body() signupDTO: SignupDTO) {
    const user = await this.authService.signup(signupDTO);
    return user;
  }
  @Public()
  @Post('login')
  async login(@Body() loginDTO: LoginDTO) {
    const result = await this.authService.login(loginDTO);
    return result;
  }
}
