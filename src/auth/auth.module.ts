import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret', // bí mật
      signOptions: { expiresIn: '1h' }, // token hết hạn sau 1h
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  //   providers: [AuthService, JwtStrategy],
  //   exports: [AuthService], // để module khác dùng AuthService
})
export class AuthModule {}
