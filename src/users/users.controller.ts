import { Body, Controller, Logger, Post } from "@nestjs/common";
import { AddUserResponse } from "src/utils/types";
import UsersService from "./users.service";
import type { User } from "src/generated/prisma/client";

@Controller('user/')
export default class UsersController {
  private logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) { }

  @Post('add')
  async addUser(@Body() data: User): Promise<AddUserResponse> {
    this.logger.log("Add user API called");

    return await this.usersService.addUser(data);
  }

}
