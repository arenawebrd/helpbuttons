import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';
import { Network } from './network.entity';
import { TagModule } from '../tag/tag.module';
import { StorageModule } from '../storage/storage.module';
import { UserModule } from '../user/user.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Network]),
    TagModule,
    StorageModule,
    CacheModule.register(),
    StorageModule,
    forwardRef(() => UserModule)
  ],
  controllers: [
    NetworkController
  ],
  providers: [
    NetworkService,
  ],
  exports: [NetworkService]
})
export class NetworkModule {}
