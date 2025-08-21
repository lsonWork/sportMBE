import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDTO } from './DTO/SignupDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enum/Role';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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
}
