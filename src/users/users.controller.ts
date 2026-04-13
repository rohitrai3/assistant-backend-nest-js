import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { AddUserResponse, GetUserByUsernameResponse } from 'src/utils/types';
import UsersService from './users.service';
import type { User } from 'src/generated/prisma/client';

@Controller('user/')
export default class UsersController {
  private logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @Post('add')
  async addUser(@Body() data: User): Promise<AddUserResponse> {
    this.logger.log('Add user API called');

    return await this.usersService.addUser(data);
  }

  @Get('get/:username')
  async getUserByUsername(
    @Param() params: any,
  ): Promise<GetUserByUsernameResponse> {
    this.logger.log('Get user by username API called');

    return await this.usersService.getUserByUsername(params.username);
  }
}
