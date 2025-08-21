// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lấy token từ header Authorization: Bearer xxx
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET || 'super-secret',
//     });
//   }

//   // eslint-disable-next-line @typescript-eslint/require-await
//   async validate(payload: any) {
//     // payload chính là data đã được sign lúc login
//     // return sẽ gắn vào request.user
//     return { userId: payload.sub, username: payload.username };
//   }
// }
