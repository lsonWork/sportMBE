import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/common/enum/Role';

export interface JwtPayload {
  email: string;
  userId: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const { userId } = payload;
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }
}
