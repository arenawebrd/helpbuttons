import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { dbIdGenerator } from '@src/shared/helpers/nanoid-generator.helper';
import { Role } from '@src/shared/types/roles';
import { Repository } from 'typeorm';
import { ButtonService } from '../button/button.service';
import { User } from '../user/user.entity';
import { Post } from './post.entity';
import { CommentPrivacyOptions } from '@src/shared/types/privacy.enum';
import translate, {
  readableDate,
} from '@src/shared/helpers/i18n.helper';
import { mentionsOfMessage } from '@src/shared/types/message.helper';
import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(forwardRef(() => ButtonService))
    private buttonService: ButtonService,
    @Inject(UserService)
    private userService: UserService,
    @Inject(StorageService)
    private storageService: StorageService,
  ) {}

  new(message: string, images: string[], buttonId: string, author: User) {
    return this.storageService.storageMultipleImages(images)
    .then((imagesStored ) => {
      return this.buttonService
      .findById(buttonId, true)
      .then((button) => {
        const post = {
          id: dbIdGenerator(),
          message,
          button,
          author,
          images: imagesStored
        };
        return this.postRepository
          .insert([post])
          .then((result) => post);
      });
    })
    
  }

  findById(id: string) {
    return this.postRepository.findOne({
      where: { id },
      relations: ['author', 'button', 'button.owner'],
    });
  }

  public findByButtonId(buttonId, currentUser) {
    return this.postRepository
      .find({
        where: { button: { id: buttonId }, deleted: false },
        relations: ['comments', 'author', 'comments.author'],
        order: {
          created_at: 'DESC',
          comments: { created_at: 'ASC' },
        },
      })
      .then((posts) => {
        let commentPosts = this.removeDeletedComments(posts);
        commentPosts = this.removePrivateComments(
          commentPosts,
          currentUser,
        );
        commentPosts = this.removeBlockedUsersComments(commentPosts);
        return commentPosts;
      })
      .then((posts) => {
        var _ = require('lodash/array');

        let mentionedUsers = []
        posts.map((post) => 
          post.comments.map((comment) => {
            _.union
            mentionedUsers = [...mentionedUsers,mentionsOfMessage(comment.message, '')]
          })
        );
        const uniqMentionedUsers = _.uniq(_.flatten(mentionedUsers))
        return Promise.all(uniqMentionedUsers.map((username) => this.userService.findByUsername(username)))
        .then((users) => {
          return posts.map((post) => {return {...post,comments: post.comments.map((comment) => {
            const commentsMentionUsers = mentionsOfMessage(comment.message, '').map((mention) => users.find((user) => user.username == mention))
            return {...comment, mentions: commentsMentionUsers}
          })}});
        })
      });
  }

  removeDeletedComments(posts) {
    return posts.map((post) => {
      return {
        ...post,
        comments: post.comments.filter(
          (comment) => comment.deleted == false,
        ),
      };
    });
  }

  removePrivateComments(posts, currentUser) {
    return posts.map((post) => {
      return {
        ...post,
        comments: post.comments.filter((comment) => {
          if (
            currentUser &&
            comment.message.indexOf(`@${currentUser.username}`) > -1
          ) {
            return true;
          }
          if (
            comment.privacy == CommentPrivacyOptions.PUBLIC ||
            post.author.id == currentUser?.id ||
            comment.author.id == currentUser?.id
          ) {
            return true;
          }
        }),
      };
    });
  }

  removeBlockedUsersComments(posts) {
    return posts.map((post) => {
      return {
        ...post,
        comments: post.comments.filter(
          (comment) =>
            post.author.role != Role.blocked &&
            comment.author.role != Role.blocked,
        ),
      };
    });
  }

  async delete(postId: string) {
    return this.findById(postId).then((post) => {
      return this.postRepository
        .update(post.id, { deleted: true })
        .then((res) => {
          return post;
        });
    });
  }

  renewButtonPost(user, button) {
    return this.new(
      translate(user.locale, 'post.renewPost', [
        readableDate(user.locale),
      ]),
      [],
      button.id,
      user,
    );
  }

  public deleteme(authorId: string) {
    return this.postRepository.delete({ author: { id: authorId } });
  }
}
