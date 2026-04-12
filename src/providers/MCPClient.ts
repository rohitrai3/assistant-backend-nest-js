import {
  MessageParam,
  Tool,
} from '@anthropic-ai/sdk/resources/messages/messages.mjs';
import {
  ContentBlockDelta,
  ContentBlockStart,
  McpResponse,
} from '../utils/types';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import TtsModel from './TTS';

@Injectable()
export default class McpClient {
  private readonly logger = new Logger(McpClient.name);
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];
  @Inject()
  private ttsModel: TtsModel;

  constructor() {
    this.logger.log('Initialize McpClient');
    this.mcp = new Client({ name: 'mcp-client-cli', version: '1.0.0' });
  }

  async connectToServer(serverScriptPath: string | undefined) {
    this.logger.log('Connecting to server...');

    if (!serverScriptPath) {
      this.logger.log('Invalid server path: ', serverScriptPath);

      return;
    }

    try {
      const command = process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });

      this.logger.log(
        'Connected to server with tools:',
        this.tools.map(({ name }) => name),
      );
    } catch (e) {
      this.logger.error('Failed to connect to MCP server: ', e);
      throw e;
    }
  }

  async processQuery(query: string, server: Server) {
    const messages: MessageParam[] = [
      {
        role: 'user',
        content: query,
      },
    ];

    const response = await fetch(`${process.env.LLM_BACKEND_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
      },
      body: JSON.stringify({
        messages: messages,
        tools: this.tools,
        stream: true,
      }),
    })
      .then((res) => this.processStream(res, server))
      .catch((err) => this.logger.error('Error prompting LLM: ', err))
      .finally(() => this.logger.log('Prompt processing complete.'));

    console.log('response: ', response);
    // Process response and handle tool calls
    const finalText: string[] = [];

    // for (const content of response.content) {
    //   if (content.type === "text") {
    //     console.log("text");
    //     finalText.push(content.text);
    //   } else if (content.type === "tool_use") {
    //     console.log("tool_use");
    //     // Execute tool call
    //     const toolName = content.name;
    //     const toolArgs = content.input as { [x: string]: unknown } | undefined;
    //
    //     const result = await this.mcp.callTool({
    //       name: toolName,
    //       arguments: toolArgs,
    //     });
    //     console.log("result: ", result);
    //     finalText.push(
    //       `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`,
    //     );
    //
    //     // Continue conversation with tool results
    //     messages.push({
    //       role: "user",
    //       content: result.content as string,
    //     });
    //
    //     // Get next response from Claude
    //     const response = {
    //       content: [
    //         {
    //           type: "text",
    //           text: "Thank you.",
    //         }
    //       ]
    //     };
    //
    //     finalText.push(
    //       response.content[0].type === "text" ? response.content[0].text : "",
    //     );
    //   }
    // }

    return finalText.join('\n');
  }

  async cleanup() {
    /**
     * Clean up resources
     */
    await this.mcp.close();
  }

  private processStream(res: Response, server: Server) {
    const stream = res.body;
    let toolName = '';
    let toolInput = '';
    let response = '';

    if (stream) {
      const reader = stream.getReader();

      const readChunk = () => {
        reader
          .read()
          .then(async ({ value, done }) => {
            if (done) {
              console.log('Stream finished');

              if (toolName) {
                await this.callTool(toolName, toolInput, server);
              }

              return;
            }

            const chunkString = new TextDecoder().decode(value);
            const splitChunk = chunkString.split('\n');
            splitChunk.map(async (chunk) => {
              if (chunk.startsWith('data')) {
                console.log('chunk:', chunk);
                const data = JSON.parse(chunk.substring(6)) as
                  | ContentBlockStart
                  | ContentBlockDelta;
                console.log('data:', data);
                if (data.type === 'content_block_start') {
                  const contentBlock = data.content_block;

                  if (contentBlock.type === 'thinking') {
                    server.emit('assistant.thinking.start');
                  } else if (contentBlock.type === 'text') {
                    server.emit('assistant.response.start');
                  } else if (contentBlock.type === 'tool_use') {
                    server.emit('assistant.tool.start', contentBlock.name);
                    toolName = contentBlock.name;
                  }
                } else if (data.type === 'content_block_delta') {
                  const delta = data.delta;

                  if (delta.type === 'thinking_delta') {
                    server.emit('assistant.thinking', delta.thinking);
                  } else if (delta.type === 'text_delta') {
                    server.emit('assistant.response', delta.text);
                    response = response + delta.text;
                  } else if (delta.type === 'signature_delta') {
                    server.emit('assistant.signature');
                    await this.ttsModel.synthesizeSpeech(response, server);
                    response = '';
                  } else if (delta.type === 'input_json_delta') {
                    server.emit('assistant.tool', delta.partial_json);
                    toolInput = toolInput + delta.partial_json;
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

  private async callTool(name: string, input: string, server: Server) {
    this.logger.log('input: ', input);
    const toolName = name;
    let toolArgs: { [x: string]: unknown } | undefined;
    if (input) {
      toolArgs = JSON.parse(input) as { [x: string]: unknown } | undefined;
    }

    const result = (await this.mcp.callTool({
      name: toolName,
      arguments: toolArgs,
    })) as McpResponse;

    server.emit('assistant.response', result.content[0].text);
    await this.ttsModel.synthesizeSpeech(result.content[0].text, server);
  }
}
