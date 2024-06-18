import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupRequestDto } from './auth.dto';
import { UserService } from '../user/user.service';
import {
  dbIdGenerator,
  publicNanoidGenerator,
} from '@src/shared/helpers/nanoid-generator.helper';
import { UserCredentialService } from '../user-credential/user-credential.service';
import { NodeEnv } from '@src/shared/types';
import { MailService } from '../mail/mail.service';
import { ExtractJwt } from 'passport-jwt';
import { catchError } from 'rxjs';
import { User } from '../user/user.entity';
import { StorageService } from '../storage/storage.service';
import { ValidationException } from '@src/shared/middlewares/errors/validation-filter.middleware';
import { getManager } from 'typeorm';
import { Role } from '@src/shared/types/roles';
import { UserCredential } from '../user-credential/user-credential.entity';
import {
  checkHash,
  generateHash,
} from '@src/shared/helpers/generate-hash.helper';
import { UserUpdateDto } from '../user/user.dto';
import { CustomHttpException } from '@src/shared/middlewares/errors/custom-http-exception.middleware';
import { ErrorName } from '@src/shared/types/error.list';
import { isImageData } from '@src/shared/helpers/imageIsFile';
import { NetworkService } from '../network/network.service';
import { InviteService } from '../invite/invite.service';
import { Exception } from 'handlebars';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userCredentialService: UserCredentialService,
    private readonly mailService: MailService,
    private jwtTokenService: JwtService,
    private readonly storageService: StorageService,
    private readonly networkService: NetworkService,
    private readonly inviteService: InviteService,
  ) {}

  async signup(signupUserDto: SignupRequestDto) {
    const verificationToken = publicNanoidGenerator();
    let emailVerified = false;
    let accessToken = {};

    let userRole = Role.registered;
    const userCount = await this.userService.userCount();
    if (userCount < 1) {
      userRole = Role.admin;
    }else{
      try{
        const selectedNetwork = await this.networkService.findDefaultNetwork();
  
        if(selectedNetwork.inviteOnly)
        {
          const validInviteCode = await this.inviteService.isInviteCodeValid(signupUserDto.inviteCode)
          if(!validInviteCode)
          {
            throw new CustomHttpException(ErrorName.inviteOnly)
          }
        }
      }catch(error){
          console.error('network not found?')
      }
    }

    const newUserDto = {
      username: signupUserDto.username,
      email: signupUserDto.email,
      role: userRole,
      name: signupUserDto.name,
      verificationToken: publicNanoidGenerator(),
      emailVerified: emailVerified,
      id: dbIdGenerator(),
      avatar: null,
      description: '',
      locale: signupUserDto.locale,
      receiveNotifications: true,
      showButtons: false,
      tags: signupUserDto.tags,
      radius: 0,
    };

    const regex = /^[a-zA-Z0-9\_\-\.]+$/gm;
    if(!signupUserDto.username.match(regex))
    {
      throw new CustomHttpException(ErrorName.InvalidUsername);
    }

    const emailExists = await this.userService.isEmailExists(
      signupUserDto.email,
    );
    if (emailExists) {
      throw new CustomHttpException(ErrorName.EmailAlreadyRegistered);
    }

    const usernameExists = await this.userService.findByUsername(
      signupUserDto.username,
    );
    if (usernameExists) {
      throw new CustomHttpException(
        ErrorName.UsernameAlreadyRegistered,
      );
    }
    if(signupUserDto.avatar)
    {
      try {
        newUserDto.avatar = await this.storageService.newImage64(
          signupUserDto.avatar,
        );
      } catch (err) {
        throw new CustomHttpException(ErrorName.InvalidMimetype);
      }
    }
    return this.userService
      .createUser(newUserDto)
      .then((user) => {
        return this.createUserCredential(
          newUserDto.id,
          signupUserDto.password,
        );
      })
      .then((user) => {
        if (!newUserDto.emailVerified && userCount > 1) {
          // only send login token if not creating admin
          this.sendLoginToken(newUserDto, true);
        }
        return user;
      })
      .then((userCredentials) => {
        return this.getAccessToken(newUserDto);
      })
      .catch((error) => {
        console.error(error);
        throw new CustomHttpException(
          ErrorName.UnspecifiedInternalServerError,
        );
      });
  }
  private async createUserCredential(
    userId,
    plainPassword,
  ): Promise<void | UserCredential> {
    return this.userCredentialService.createUserCredential({
      userId: userId,
      password: generateHash(plainPassword),
    });
  }

  private async updateUserCredential(
    userId,
    plainPassword,
  ) {
    
    return this.userCredentialService.updateUserCredential({
      userId: userId,
      password: generateHash(plainPassword),
    });
  }

  private sendLoginToken(user: User, sendActivation = false) {
    const activationUrl: string = `/LoginClick/${user.verificationToken}`;

    if (!sendActivation) {
      this.mailService.sendLoginTokenEmail({
        to: user.email,
        activationUrl,
        locale: user.locale
      });
    }else {
      this.mailService.sendActivationEmail({
        to: user.email,
        activationUrl,
        locale: user.locale
      });
    }
  }

  async loginToken(verificationToken: string) {
    return await this.userService
      .loginToken(verificationToken)
      .then((user: User) => {
        return this.getAccessToken(user);
      });
  }

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const userCredential = await this.userCredentialService.findOne(
      user.id,
    );
    if (!userCredential) {
      return null;
    }

    if (!(await checkHash(plainPassword, userCredential.password))) {
      return null;
    }

    return this.getAccessToken(user);
  }

  async getAccessToken(user) {
    const payload = { username: user.email, sub: user.id };

    const accesstoken = {
      token: this.jwtTokenService.sign(payload),
    };
    return accesstoken;
  }
  async getCurrentUser(userId) {
    return this.userService.findById(userId);
  }

  async update(data: UserUpdateDto, currentUser) {
    let newUser = {
      avatar: null,
      email: data.email,
      name: data.name,
      description: data.description,
      locale: data.locale,
      receiveNotifications: data.receiveNotifications,
      showButtons: data.showButtons,
      tags: data.tags,
      center: data.center,
      address: data.address,
      radius: data.radius,
      phone: data.phone,
      publishPhone: data.publishPhone
    };

    if (isImageData(data.avatar)) {
      try {
        newUser.avatar = await this.storageService.newImage64(
          data.avatar,
        );
        if(currentUser.avatar != newUser.avatar)
        {
          this.storageService.delete(currentUser.avatar)
        }
      } catch (err) {
        console.log(`avatar: ${err.message}`);
      }
    }else if(data.avatar){
      newUser.avatar = data.avatar;
    }
    return this.userService
      .update(currentUser.id, newUser)
      .then(() => {
        if (data.set_new_password) {
          return this.updateUserCredential(
            currentUser.id,
            data.password_new,
          ).then(() => true);
        }
        return Promise.resolve(true);
      });
  }

  async requestNewLoginToken(email: string) {
    return await this.userService
      .findOneByEmail(email)
      .then((user: User) => {
        if (user) {
          this.userService.createNewLoginToken(user.id)
          .then((verificationToken) => {
            this.sendLoginToken( {...user, verificationToken: verificationToken}, false);
          })
        }
        return Promise.resolve(true);
      });
  }

  
}
