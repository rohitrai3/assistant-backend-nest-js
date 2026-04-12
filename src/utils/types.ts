export type McpResponse = {
  content: Text[];
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
