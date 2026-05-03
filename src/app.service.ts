import { Injectable } from '@nestjs/common';
import { LoginRequest, LoginResponse } from './utils/types';
import { PrismaService } from './prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  ping(): string {
    return 'Success';
  }

  async login(input: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: input.username },
      include: {
        selectedEndpoint: true,
        endpoints: true,
      },
    });

    if (user) {
      if (user.selectedEndpoint) {
        console.log('User and endpoint exist');

        return {
          status: 'Success',
          data: {
            username: user.username,
            selectedEndpointUrl: user.selectedEndpoint.url,
            endpoints: user.endpoints.map((endpoint) => endpoint),
          },
        };
      } else {
        console.log('User exist but not endpoint');
        const endpoint = await this.prisma.endpoint.create({
          data: {
            id: uuid(),
            url: input.endpoint.url,
            isSelected: input.endpoint.isSelected,
            user: {
              connect: { username: input.username },
            },
            selectedFor: {
              connect: { username: input.username },
            },
          },
        });

        const user = await this.prisma.user.findUnique({
          where: { username: input.username },
          include: {
            selectedEndpoint: true,
            endpoints: true,
          },
        });

        if (endpoint && user && user.selectedEndpoint) {
          return {
            status: 'Success',
            data: {
              username: user.username,
              selectedEndpointUrl: user.selectedEndpoint.url,
              endpoints: user.endpoints.map((endpoint) => endpoint),
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
            url: input.endpoint.url,
            isSelected: input.endpoint.isSelected,
            user: {
              connect: { username: input.username },
            },
            selectedFor: {
              connect: { username: input.username },
            },
          },
        });
        const user = await this.prisma.user.findUnique({
          where: { username: input.username },
          include: {
            selectedEndpoint: true,
            endpoints: true,
          },
        });

        if (endpoint && user && user.selectedEndpoint) {
          return {
            status: 'Success',
            data: {
              username: user.username,
              selectedEndpointUrl: user.selectedEndpoint.url,
              endpoints: user.endpoints.map((endpoint) => endpoint),
            },
          };
        }
      }
    }

    return {
      status: 'Success',
      data: {
        username: user?.username ? user.username : '',
        selectedEndpointUrl: user?.selectedEndpoint?.url
          ? user.selectedEndpoint.url
          : '',
        endpoints: user?.endpoints
          ? user.endpoints.map((endpoint) => endpoint)
          : [],
      },
    };
  }

  async deleteAll() {
    await this.prisma.endpoint.deleteMany({});
    await this.prisma.user.deleteMany({});
  }
}
