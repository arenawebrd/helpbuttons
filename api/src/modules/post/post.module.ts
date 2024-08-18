import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ButtonModule } from '../button/button.module';
import { UserModule } from '../user/user.module';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { StorageModule } from '../storage/storage.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    UserModule,
    forwardRef(() => ButtonModule),
    UserModule,
    StorageModule
  ],
  controllers: [
    PostController
  ],
  providers: [
    CommentService,
    PostService
  ],
  exports: [
    CommentService,
    PostService
  ]
})
export class PostModule {}
