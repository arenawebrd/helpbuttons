import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { dbIdGenerator } from '@src/shared/helpers/nanoid-generator.helper';
import { ActivityEventName } from '@src/shared/types/activity.list';
import { EntityManager, Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  @OnEvent(ActivityEventName.NewPost)
  @OnEvent(ActivityEventName.NewPostComment)
  @OnEvent(ActivityEventName.NewButton)
  @OnEvent(ActivityEventName.DeleteButton)
  async notifyOwner(payload: any) {
    switch (payload.activityEventName) {
      /*
      if activity is marked as "outbox" it means it will be used on the daily mail send with a resume of activities
      */
      case ActivityEventName.NewPostComment: {
        // notify
        // - dont send mail to author of comment
        // - send mail to owner of button if owner is not author
        // - notify users mentioned on comment
        const message = payload.data.message;
        const author = payload.data.author;

        // check users mentioned in comment, and notify them, not on outbox, but directly
        await this.findUserMentionsInMessage(
          message,
          author.username,
        ).then((usersMentioned) => {
          return Promise.all(
            usersMentioned.map((user) => {
              return this.newActivity(user, payload, true, false);
            }),
          );
        });

        // notify author:
        await this.newActivity(author, payload, false, false);

        break;
      }
      case ActivityEventName.NewPost: {
        const button = payload.data.button;
        // check users following the button of this post, and add a new actitivy to the daily outbox
        const usersFollowing =
          await this.userService.findAllByIdsToBeNotified(
            button.followedBy,
          );

        // notify users following button...
        await Promise.all(
          usersFollowing.map((user) => {
            return this.newActivity(user, payload, false, true);
          }),
        );

        // notify button owner
        await this.newActivity(button.owner, payload, false, false);
        break;
      }
      case ActivityEventName.NewButton: {
        const button = payload.data;

        if (button.tags.length < 1) {
          break;
        }


        // calculate users to be notified:
        // - check users with this interests/tags
        // - if radius = 0, include user, else check if user is in radius.!
        const getUsersToNotify = (button) => {
          const tagQuery = button.tags
            .map((tag) => `'${tag}' = any(tags)`)
            .join(' OR ');
          const query = `select id, radius,center,ST_Distance(center, ST_Point(${button.longitude}, ${button.latitude},4326)::geography ) / 1000 as distance from public.user where ${tagQuery}`;

          return this.entityManager
            .query(query)
            .then((usersDistanceToNotify) => {
              return usersDistanceToNotify.filter((user) => {
                if (user.radius < 1) {
                  return true;
                } else {
                  if (user.distance <= user.radius) {
                    return true;
                  }
                }
                return false;
              });
            });
        };

        const usersIds = (await getUsersToNotify(button))
          .map((user) => user.id)
          .filter((userId) => userId != button.owner.id);

        const usersToNotify =
          await this.userService.findAllByIdsToBeNotified(usersIds);
        // notify users following this tag
        await Promise.all(
          usersToNotify.map((user) => {
            return this.newActivity(user, payload, false, true);
          }),
        );

        await this.newActivity(button.owner, payload, false, false);
        break;
      }
    }
  }

  findByUserId(userId: string) {
    return this.activityRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
      order: { created_at: 'DESC' },
    });
  }

  markAllAsRead(userId: string) {
    return this.activityRepository.update(
      { read: false, owner: { id: userId } },
      { read: true },
    );
  }

  markAsRead(userId: string, notificationId: string) {
    return this.activityRepository.update(
      { id: notificationId, owner: { id: userId } },
      { read: true },
    );
  }

  async findUserMentionsInMessage(message, authorOfMessage) {
    var userPattern = /@[\w]+/gi;
    let usernames = message.match(userPattern);

    if (!usernames) {
      return [];
    }

    const usernamesMentioned = usernames
      .map((username) => username.substring(1))
      .filter((username) => username != authorOfMessage);

    return await Promise.all(
      usernamesMentioned.map(async (username) => {
        return await this.userService.findByUsername(username);
      }),
    );
  }

  newActivity(user, payload, sendMail = false, outbox = false) {
    console.log(
      `new activity [${user.username}] ${payload.activityEventName} mail? ${sendMail} outbox? ${outbox}`,
    );
    const activity = {
      id: dbIdGenerator(),
      owner: user,
      eventName: payload.activityEventName,
      data: JSON.stringify(payload.data),
      outbox: outbox,
    };
    return this.activityRepository.insert([activity]);
  }
}
