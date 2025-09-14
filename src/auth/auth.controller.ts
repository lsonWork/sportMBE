import { Body, Controller, Patch } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { SignupDTO } from './DTO/SignupDTO';
import { AuthService } from './auth.service';
import { LoginDTO } from './DTO/LoginDTO';
import { Public } from './public.decorator';
import { ApiBody } from '@nestjs/swagger';
// import { SendOtpDTO } from './DTO/SendOtpDTO';
// import { VerifyOtpDTO } from './DTO/VerifyOtpDTO';
import { ChangePasswordDTO } from './DTO/ChangePasswordDTO';

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
  @Post('signin')
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

  // @Public()
  // @Post('send-otp')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       email: { type: 'string', example: 'user@example.com' },
  //     },
  //   },
  // })
  // async sendOtp(@Body() sendOtpDTO: SendOtpDTO) {
  //   const result = await this.authService.sendOtp(sendOtpDTO);
  //   return result;
  // }

  // @Public()
  // @Post('verify-otp')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       email: { type: 'string', example: 'user@example.com' },
  //       otp: { type: 'string', example: '123456' },
  //     },
  //   },
  // })
  // async verifyOtp(@Body() verifyOtpDTO: VerifyOtpDTO) {
  //   const result = await this.authService.verifyOtp(verifyOtpDTO);
  //   return result;
  // }

  @Public()
  @Patch('update-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        newPassword: { type: 'string', example: 'P@ssw0rd123' },
      },
    },
  })
  async changePassword(@Body() changePasswordDTO: ChangePasswordDTO) {
    const result = await this.authService.changePassword(changePasswordDTO);
    return result;
  }
}
