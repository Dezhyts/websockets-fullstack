import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JoinStreamDto, LeaveStreamDto, SendMessageDto } from './dto/chat-dto';

@Controller('_types/chat')
export class ChatController {
  @Post('join_stream')
  wsJoin(@Body() body: JoinStreamDto) {}

  @Post('leave_stream')
  wsLeave(@Body() body: LeaveStreamDto) {}

  @Post('send_message')
  wsSendMessage(@Body() body: SendMessageDto) {}
}
