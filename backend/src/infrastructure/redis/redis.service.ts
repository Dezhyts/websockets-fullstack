import { Injectable } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

@Injectable()
export class RedisAdapter extends IoAdapter {}
