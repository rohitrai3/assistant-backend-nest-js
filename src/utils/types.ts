import { Endpoint, User } from 'src/generated/prisma/client';

export type DeleteUserByUsernameResponse = {
  status: string;
  data: User | string;
};

export type DeleteUserByUsernameRequest = {
  username: string;
};

export type LoginResponse = {
  status: string;
  data: LoginData;
};

export type LoginRequest = {
  username: string;
  endpoint: Endpoint;
};

export type LoginData = {
  username: string | null;
  selectedEndpointUrl?: string | null;
  endpoints: Endpoint[];
};

export type SyncData = {
  username: string;
  backendEndpoints: string[];
  activeEndpoint: string;
};

export type GetUserByUsernameResponse = {
  status: string;
  data: User | string;
};

export type GetUserByUsernameRequest = {
  username: string;
};

export type AddUserResponse = {
  status: string;
  data: User;
};

export type PingResponse = {
  status: string;
};

export type McpResponse = {
  content: Text[];
};

export type MessageStart = {
  type: 'message_start';
};

export type MessageStop = {
  type: 'message_stop';
};

export type ContentBlockStart = {
  type: 'content_block_start';
  index: number;
  content_block: Thinking | Text | ToolUse;
};

export type ContentBlockDelta = {
  type: 'content_block_delta';
  index: number;
  delta: TextDelta | ThinkingDelta | SignatureDelta | InputJsonDelta;
};

export type ContentBlockStop = {
  type: 'content_block_stop';
  index: number;
};

export type ToolUse = {
  type: 'tool_use';
  id: string;
  name: string;
};

export type InputJsonDelta = {
  type: 'input_json_delta';
  partial_json: string;
};

export type SignatureDelta = {
  type: 'signature_delta';
  signature: string;
};

export type Text = {
  type: 'text';
  text: string;
};

export type TextDelta = {
  type: 'text_delta';
  text: string;
};

export type Thinking = {
  type: 'thinking';
  thinking: string;
};

export type ThinkingDelta = {
  type: 'thinking_delta';
  thinking: string;
};
