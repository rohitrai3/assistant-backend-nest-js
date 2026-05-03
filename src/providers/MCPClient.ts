import {
  ContentBlockParam,
  MessageParam,
  TextBlockParam,
  ThinkingBlockParam,
  Tool,
  ToolUseBlockParam,
} from '@anthropic-ai/sdk/resources/messages/messages.mjs';
import {
  ContentBlockDelta,
  ContentBlockStart,
  ContentBlockStop,
  McpResponse,
  MessageStart,
  MessageStop,
} from '../utils/types';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import TtsModel from './TTS';
import { join } from 'path';
import { readdir, readFile } from 'fs/promises';
import { ToolResultBlockParam } from '@anthropic-ai/sdk/resources';

@Injectable()
export default class McpClient {
  private readonly logger = new Logger(McpClient.name);
  private messages: MessageParam[] = [];
  private assistantInstruction: string;
  private mcp: Client;
  private clients: Map<string, Client>;
  private tools: Tool[] = [];
  @Inject()
  private ttsModel: TtsModel;

  constructor() {
    this.logger.log('Initialize McpClient');
    this.mcp = new Client({ name: 'mcp-client-cli', version: '1.0.0' });
    this.clients = new Map();
  }

  async loadServers() {
    this.logger.log('Loading MCP servers...');
    const dir = join(process.cwd(), 'src/assets/mcp_servers/');
    const files = await readdir(dir);

    files.forEach(async (file) => {
      const name = file.split('.')[0];
      this.logger.log(`Loading ${name} MCP server...`);

      try {
        const command = process.execPath;
        const transport = new StdioClientTransport({
          command,
          args: [dir + file],
        });
        const client = new Client({
          name: `mcp-client-${name}`,
          version: '1.0.0',
        });

        await client.connect(transport);

        const toolsResult = await client.listTools();

        toolsResult.tools.map((tool) => {
          this.tools.push({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema,
          });
          this.clients.set(tool.name, client);
          this.logger.log(`Server: ${name}, Tool: ${tool.name}`);
        });
      } catch (e) {
        this.logger.error(`Failed to connect to ${name} MCP server:`, e);
        throw e;
      }
    });
  }

  async initAssistant(username: string) {
    const filePath = join(process.cwd(), 'src/assets/Skills/finance/SKILL.md');
    const financeSkill = await readFile(filePath, 'utf-8');
    this.messages = [];
    this.assistantInstruction = `You are an assistant of the user whose name is ${username}.
      When user talks about finances or transactions, read following skill to provide assistanc: ${financeSkill}.
      `;
  }

  async processQuery(query: string, server: Server, isSynthesize: boolean) {
    this.messages.push({
      role: 'user',
      content: query,
    });

    await this.callLlm(server, isSynthesize);
  }

  async processToolResponse(
    id: string,
    response: string,
    server: Server,
    isSynthesize: boolean,
  ) {
    this.messages.push({
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: id, content: response }],
    });
    console.log('messages:', this.messages);

    await this.callLlm(server, isSynthesize);
  }

  private async callLlm(server: Server, isSynthesize: boolean) {
    await fetch(`${process.env.LLM_BACKEND_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
      },
      body: JSON.stringify({
        messages: this.messages,
        tools: this.tools,
        stream: true,
        system: this.assistantInstruction,
      }),
    })
      .then((res) => this.processStream(res, server, isSynthesize))
      .catch((err) => this.logger.error('Error prompting LLM: ', err))
      .finally(() => this.logger.log('Prompt processing complete.'));
  }

  private processStream(res: Response, server: Server, isSynthesize: boolean) {
    const stream = res.body;
    let toolId = '';
    let toolName = '';
    let toolInput = '';
    let response = '';
    let thinking = '';

    if (stream) {
      const reader = stream.getReader();

      const readChunk = () => {
        reader
          .read()
          .then(async ({ value, done }) => {
            if (done) {
              let thinkingBlock: ThinkingBlockParam;
              let textBlock: TextBlockParam;
              let toolUseBlock: ToolUseBlockParam;
              let toolResultBlock: ToolResultBlockParam;
              const message: MessageParam = {
                role: 'assistant',
                content: [],
              };

              if (thinking) {
                thinkingBlock = {
                  type: 'thinking',
                  thinking: thinking,
                  signature: '',
                };
                (message.content as ContentBlockParam[]).push(thinkingBlock);
                console.log('thinkingBlock:', thinkingBlock);
              }

              if (response) {
                textBlock = {
                  type: 'text',
                  text: response,
                };
                (message.content as ContentBlockParam[]).push(textBlock);
                console.log('textBlock:', textBlock);
              }

              if (toolName) {
                toolUseBlock = {
                  type: 'tool_use',
                  id: toolId,
                  name: toolName,
                  input: toolInput,
                };
                (message.content as ContentBlockParam[]).push(toolUseBlock);
                console.log('toolUseBlock:', toolUseBlock);

                const response = await this.callTool(toolName, toolInput);

                if (response) {
                  toolResultBlock = {
                    type: 'tool_result',
                    tool_use_id: toolId,
                    content: response,
                  };
                  (message.content as ContentBlockParam[]).push(
                    toolResultBlock,
                  );
                  console.log('toolResultBlock:', toolResultBlock);
                }
                this.callLlm(server, isSynthesize);
              }

              this.messages.push(message);
              console.log('Stream finished');
              return;
            }

            const chunkString = new TextDecoder().decode(value);
            const splitChunk = chunkString.split('\n');
            splitChunk.map(async (chunk) => {
              if (chunk.startsWith('data')) {
                console.log('chunk:', chunk);
                const data = JSON.parse(chunk.substring(6)) as
                  | MessageStart
                  | ContentBlockStart
                  | ContentBlockDelta
                  | ContentBlockStop
                  | MessageStop;

                if (data.type === 'message_start') {
                  server.emit('conversation.start');
                } else if (data.type === 'content_block_start') {
                  const contentBlock = data.content_block;

                  if (contentBlock.type === 'thinking') {
                    server.emit('assistant.thinking.start');
                  } else if (contentBlock.type === 'text') {
                    server.emit('assistant.message.start');
                  } else if (contentBlock.type === 'tool_use') {
                    server.emit('assistant.tool.name', contentBlock.name);
                    toolId = contentBlock.id;
                    toolName = contentBlock.name;
                  }
                } else if (data.type === 'content_block_delta') {
                  const delta = data.delta;

                  if (delta.type === 'thinking_delta') {
                    server.emit('assistant.thinking.chunk', delta.thinking);
                    thinking = thinking + delta.thinking;
                  } else if (delta.type === 'text_delta') {
                    server.emit('assistant.message.chunk', delta.text);
                    response = response + delta.text;
                  } else if (delta.type === 'input_json_delta') {
                    server.emit(
                      'assistant.tool.input.chunk',
                      delta.partial_json,
                    );
                    toolInput = toolInput + delta.partial_json;
                  }
                } else if (data.type === 'content_block_stop') {
                  if (data.index === 0) {
                    server.emit('assistant.thinking.stop');
                  } else if (data.index === 1) {
                    server.emit('assistant.tool.stop');
                  }
                } else if (data.type === 'message_stop') {
                  server.emit('assistant.message.stop');

                  if (isSynthesize) {
                    await this.ttsModel.synthesizeSpeech(response, server);
                    this.logger.log('Synthesized speech sent');
                  }
                }
              }
            });

            readChunk();
          })
          .catch((err) => console.log('Error reading: ', err));
      };

      readChunk();
    }
  }

  private async callTool(name: string, input: string): Promise<string> {
    this.logger.log('input: ', input);
    const toolName = name;
    let toolArgs: { [x: string]: unknown } | undefined;
    const client = this.clients.get(toolName);

    if (input)
      toolArgs = JSON.parse(input) as { [x: string]: unknown } | undefined;

    if (!client) return '';

    const result = (await client.callTool({
      name: toolName,
      arguments: toolArgs,
    })) as McpResponse;

    return result.content[0].text;
  }

  async cleanup() {
    /**
     * Clean up resources
     */
    await this.mcp.close();
  }
}
