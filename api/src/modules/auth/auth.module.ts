import { Module } from '@nestjs/common';
import configs from '@src/config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserCredentialModule } from '../user-credential/user-credential.module';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { TagModule } from '../tag/tag.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { StorageModule } from '../storage/storage.module';
import { NetworkModule } from '../network/network.module';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: configs().jwtSecret,
      signOptions: {expiresIn: '60s'}
    }),
    UserCredentialModule,
    UserModule,
    MailModule,
    StorageModule,
    TagModule,
    NetworkModule,
    InviteModule
  ],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy],
})
export class AuthModule {}
