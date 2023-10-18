import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { AllowGuest, OnlyAdmin, OnlyRegistered } from '@src/shared/decorator/roles.decorator';
import { Role } from '@src/shared/types/roles';
import { Auth } from '@src/shared/decorator/auth.decorator';
import { CurrentUser } from '@src/shared/decorator/current-user';
import { User } from './user.entity';
import { InviteService } from '../invite/invite.service';
import { InviteCreateDto } from '../invite/invite.dto';
// import { AllowIfNetworkIsPublic } from '@src/shared/decorator/privacy.decorator';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly inviteService: InviteService,
  ) {}

  @OnlyRegistered()
  @Get('whoAmI')
  whoAmI(@Request() req) {
    return req.user;
  }

  @AllowGuest()
  // @AllowIfNetworkIsPublic()
  @Get('/find/:username')
  async find(@Param('username') username: string) {
    return await this.userService
      .findByUsername(username, true);
  }

  @OnlyRegistered()
  @Get('invites')
  async invites(@CurrentUser() user: User) {
    return await this.inviteService.find(user);
  }

  @OnlyRegistered()
  @Post('createInvite')
  async createInvite(@Body() newInvitation: InviteCreateDto, @CurrentUser() user: User) {
    return await this.inviteService.create(newInvitation, user);
  }

  @OnlyAdmin()
  @Post('/updateRole/:userId/:role')
  async updateRole(@Param('userId') userId: string, @Param('role') role: Role) {
    return await this.userService.updateRole(userId, role);
  }

  @OnlyAdmin()
  @Get('moderationList')
  async moderationList()
  {
    return await this.userService.moderationList()
  }

  @AllowGuest()
  @Post('/unsubscribe/:email')
  async unsubscribe(@Param('email') email: string)
  {
    return await this.userService.unsubscribe(email);
  }
}
