export enum DurationBan {
  TEN_MINUTES = '600',
  ONE_HOUR = '3600',
  ONE_DAY = '86400',
  ONE_WEEK = '604800',
  ONE_MONTH = '2592000',
  PERMANENT = '0',
}
export interface SendMessageDto {
  streamId: string;
  message: string;
  replyToId?: string;
}

export interface JoinStreamDto {
  streamId: string;
  limit?: number;
  cursor?: string;
}

export interface LeaveStreamDto {
  streamId: string;
}

export interface BanUserDto {
  streamId: string;
  targetUserIdBan: string;
  duration: DurationBan;
}

export interface UserJoinedResponse {
  userId: string;
  username: string;
}

export interface HistoryChatResponse {
  messages: ChatMessageResponse[];
}
export interface ReplyToResponse {
  id: string;
  message: string;
  username: string;
}

export interface ChatMessageResponse {
  id: string;
  username: string;
  userId: string;
  message: string;
  createdAt: string;
  replyTo: ReplyToResponse | null;
}

export interface UserBannedResponse {
  userId: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  timeLeft?: number;
  windowSeconds?: number;
}

export interface MessagePaylodResponse {
  id: string;
  text: string;
  createdAt: string;
  replyToId: string | null;
}

export interface ClientToServerEvents {
  join_stream: (data: JoinStreamDto) => void;
  leave_stream: (data: LeaveStreamDto) => void;
  send_message: (data: SendMessageDto) => void;
  ban_user: (data: BanUserDto) => void;
}

export interface ServerToClientEvents {
  user_joined: (data: UserJoinedResponse) => void;
  history: (data: HistoryChatResponse) => void;
  message: (data: ChatMessageResponse) => void;
  ban_user: (data: UserBannedResponse) => void;
  error: (data: ErrorResponse) => void;
}
