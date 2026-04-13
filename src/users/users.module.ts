import { PrismaService } from 'src/prisma.service';
import UsersService from './users.service';
import UsersController from './users.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export default class UsersModule {}
