export interface ChatUser {
  id: string;
  username: string;
}

export interface MessagePayload {
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}
