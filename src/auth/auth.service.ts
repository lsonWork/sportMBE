import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDTO } from './DTO/SignupDTO';
import { LoginDTO } from './DTO/LoginDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enum/Role';
import { JwtService } from '@nestjs/jwt';
import { SendOtpDTO } from './DTO/SendOtpDTO';
import { RedisService } from 'src/redis/redis.service';
import { MailService } from 'src/mail/mail.service';
import { sanitizeEmail } from 'src/utils/santinizeEmail';
import { VerifyOtpDTO } from './DTO/VerifyOtpDTO';
import { ChangePasswordDTO } from './DTO/ChangePasswordDTO';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  async signup(signupObj: SignupDTO) {
    const existUser = await this.userRepository.findOneBy({
      email: signupObj.email,
    });
    if (existUser) {
      throw new HttpException(
        { message: 'User already exists' },
        HttpStatus.CONFLICT,
      );
    }
    const { password } = signupObj;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = { ...signupObj, status: true, role: Role.CLIENT };
    newAccount.password = hashedPassword;

    const user = this.userRepository.create(newAccount);

    try {
      await this.userRepository.save(user);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error creating user' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return user;
  }

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    const user = await this.userRepository.findOneBy({ email });
    if (
      !user ||
      !user.status ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new HttpException(
        { message: 'Invalid email or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { email: user.email, userId: user.userId, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access: token,
    };
  }

  async sendOtp(sendOtpDTO: SendOtpDTO) {
    const { email } = sendOtpDTO;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.mailService.sendOtp(email, 'Your OTP code', { otp });

    const redisName = `otp:${sanitizeEmail(email)}`;
    const redis = this.redisService.getClient();
    await redis.set(redisName, otp, 'EX', 60 * 15);
    return true;
  }

  async verifyOtp(verifyOtpDTO: VerifyOtpDTO) {
    const { email, otp } = verifyOtpDTO;
    const redisName = `otp:${sanitizeEmail(email)}`;
    const redis = this.redisService.getClient();
    const storedOtp = await redis.get(redisName);
    if (storedOtp !== otp) {
      throw new HttpException(
        { message: 'Invalid OTP' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return true;
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO) {
    const { email, newPassword } = changePasswordDTO;

    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    try {
      await this.userRepository.save(user);
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        { message: err.message || 'Error changing password' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return true;
  }
}
