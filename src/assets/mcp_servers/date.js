import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({
    name: "finance",
    version: "1.0.0",
});
server.registerTool("get-date-from-epoch", {
    title: "Get today's date",
    description: "Get the date of today",
    inputSchema: { epoch: z.number().describe("Epoch number of date") },
}, async ({ epoch }) => {
    console.log("get-date-from-epoch invoked");
    const date = new Date(epoch).toDateString();
    return {
        content: [
            {
                type: "text",
                text: date,
            },
        ],
    };
});
server.registerTool("get-today-date", {
    title: "Get today's date",
    description: "Get the date of today",
}, async () => {
    console.log("get-today-date invoked");
    const date = new Date().toDateString();
    return {
        content: [
            {
                type: "text",
                text: date,
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Date MCP Server running on stdio");
}
main().catch(err => {
    console.error("Fatal error in main(): ", err);
    process.exit(1);
});
