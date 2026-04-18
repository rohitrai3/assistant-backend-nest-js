import { Injectable } from '@nestjs/common';
import { UserCreateInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma.service';
import {
  AddUserResponse,
  DeleteUserByUsernameResponse,
  GetUserByUsernameResponse,
} from 'src/utils/types';
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

    return {
      status: 'Success',
      data: user ? user : 'Username not found',
    };
  }

  async deleteUserByUsername(
    username: string,
  ): Promise<DeleteUserByUsernameResponse> {
    const user = await this.prisma.user.delete({
      where: { username: username },
    });

    return {
      status: 'Success',
      data: user ? user : 'Username not found',
    };
  }
}
