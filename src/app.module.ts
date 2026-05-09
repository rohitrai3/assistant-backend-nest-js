import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import UsersModule from './users/users.module';
import { PrismaService } from './prisma.service';
import { PingModule } from './ping/ping.module';

@Module({
  imports: [ConfigModule.forRoot(), EventsModule, UsersModule, PingModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
