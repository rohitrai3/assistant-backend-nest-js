import { Injectable } from '@nestjs/common';
import { UserCreateInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma.service';
import { AddUserResponse, GetUserByUsernameResponse } from 'src/utils/types';
import { v4 as uuid } from 'uuid';

@Injectable()
export default class UsersService {
  constructor(private prisma: PrismaService) {}

  async addUser(data: UserCreateInput): Promise<AddUserResponse> {
    if (!data.id) data.id = uuid();

    const user = await this.prisma.user.create({ data });

    return {
      status: 'Success',
      data: user,
    };
  }

  async getUserByUsername(
    username: string,
  ): Promise<GetUserByUsernameResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });

    return user
      ? {
          status: 'Success',
          data: user,
        }
      : {
          status: 'Success',
          data: 'Username not found',
        };
  }
}
