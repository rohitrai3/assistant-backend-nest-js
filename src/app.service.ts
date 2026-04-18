import { Injectable } from '@nestjs/common';
import { LoginRequest, LoginResponse } from './utils/types';
import { PrismaService } from './prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  ping(): string {
    return 'Success';
  }

  async login(input: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: input.username },
      include: {
        activeEndpoint: true,
        endpoints: true,
      },
    });

    if (user) {
      if (user.activeEndpoint) {
        console.log('User and endpoint exist');

        return {
          status: 'Success',
          data: {
            username: user.username,
            activeEndpoint: user.activeEndpoint.endpoint,
            endpoints: user.endpoints.map((endpoint) => endpoint.endpoint),
          },
        };
      } else {
        console.log('User exist but not endpoint');
        const endpoint = await this.prisma.endpoint.create({
          data: {
            id: uuid(),
            endpoint: input.endpoint,
            user: {
              connect: { username: input.username },
            },
            activeFor: {
              connect: { username: input.username },
            },
          },
        });

        const user = await this.prisma.user.findUnique({
          where: { username: input.username },
          include: {
            activeEndpoint: true,
            endpoints: true,
          },
        });

        if (endpoint && user && user.activeEndpoint) {
          return {
            status: 'Success',
            data: {
              username: user.username,
              activeEndpoint: user.activeEndpoint.endpoint,
              endpoints: user.endpoints.map((endpoint) => endpoint.endpoint),
            },
          };
        }
      }
    } else {
      console.log('User does not exist');
      const user = await this.prisma.user.create({
        data: {
          id: uuid(),
          username: input.username,
        },
      });

      if (user) {
        const endpoint = await this.prisma.endpoint.create({
          data: {
            id: uuid(),
            endpoint: input.endpoint,
            user: {
              connect: { username: input.username },
            },
            activeFor: {
              connect: { username: input.username },
            },
          },
        });
        const user = await this.prisma.user.findUnique({
          where: { username: input.username },
          include: {
            activeEndpoint: true,
            endpoints: true,
          },
        });

        if (endpoint && user && user.activeEndpoint) {
          return {
            status: 'Success',
            data: {
              username: user.username,
              activeEndpoint: user.activeEndpoint.endpoint,
              endpoints: user.endpoints.map((endpoint) => endpoint.endpoint),
            },
          };
        }
      }
    }

    return {
      status: 'Success',
      data: {
        username: user?.username ? user.username : '',
        activeEndpoint: user?.activeEndpoint
          ? user.activeEndpoint.endpoint
          : '',
        endpoints: user?.endpoints
          ? user.endpoints.map((endpoint) => endpoint.endpoint)
          : [],
      },
    };
  }
}
