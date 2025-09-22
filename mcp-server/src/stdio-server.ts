#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// MCP Server using stdio transport
async function main() {
  const stdin = process.stdin;
  const stdout = process.stdout;

  stdin.setEncoding("utf8");

  stdin.on("data", async (data) => {
    try {
      const message = JSON.parse(data.toString().trim());

      if (message.jsonrpc !== "2.0") {
        sendError(message.id, -32600, "Invalid Request");
        return;
      }

      switch (message.method) {
        case "initialize":
          sendResponse(message.id, {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {
                listChanged: false,
              },
            },
            serverInfo: {
              name: "erp-mcp-server",
              version: "1.0.0",
            },
          });
          break;

        case "tools/list":
          sendResponse(message.id, {
            tools: [
              {
                name: "query_database",
                description: "Execute raw SQL queries on the ERP database",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "SQL query to execute",
                    },
                    params: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description: "Query parameters",
                      default: [],
                    },
                  },
                  required: ["query"],
                  additionalProperties: false,
                },
              },
              {
                name: "execute_crud",
                description:
                  "Perform CRUD operations (SELECT, INSERT, UPDATE, DELETE) on database tables",
                inputSchema: {
                  type: "object",
                  properties: {
                    operation: {
                      type: "string",
                      enum: ["select", "insert", "update", "delete"],
                      description: "CRUD operation type",
                    },
                    table: {
                      type: "string",
                      description: "Database table name",
                    },
                    data: {
                      type: "object",
                      description: "Data for INSERT/UPDATE operations",
                    },
                    where: {
                      type: "object",
                      description:
                        "WHERE conditions for SELECT/UPDATE/DELETE operations",
                    },
                  },
                  required: ["operation", "table"],
                },
              },
              {
                name: "get_schema",
                description: "Get database schema information",
                inputSchema: {
                  type: "object",
                  properties: {
                    table: {
                      type: "string",
                      description: "Specific table name (optional)",
                    },
                  },
                },
              },
              {
                name: "list_tables",
                description: "List all available database tables",
                inputSchema: {
                  type: "object",
                  properties: {},
                },
              },
            ],
          });
          break;

        case "tools/call":
          const { name, arguments: args } = message.params;

          try {
            let result;

            switch (name) {
              case "query_database":
                result = await prisma.$queryRawUnsafe(
                  args.query,
                  ...(args.params || [])
                );
                result = JSON.parse(
                  JSON.stringify(result, (key, value) =>
                    typeof value === "bigint" ? value.toString() : value
                  )
                );
                break;

              case "execute_crud":
                result = await handleCrudOperation(
                  args.operation,
                  args.table,
                  args.data,
                  args.where
                );
                break;

              case "get_schema":
                if (args.table) {
                  result = await prisma.$queryRawUnsafe(
                    `
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = $1 AND table_schema = 'public'
                    ORDER BY ordinal_position
                  `,
                    args.table
                  );
                } else {
                  result = await prisma.$queryRawUnsafe(`
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                    ORDER BY table_name
                  `);
                }
                break;

              case "list_tables":
                result = await prisma.$queryRawUnsafe(`
                  SELECT table_name
                  FROM information_schema.tables
                  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                  ORDER BY table_name
                `);
                break;

              default:
                throw new Error(`Unknown tool: ${name}`);
            }

            sendResponse(message.id, {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            });
          } catch (error) {
            sendError(
              message.id,
              -32603,
              (error as Error).message || "Internal error"
            );
          }
          break;

        default:
          sendError(message.id, -32601, "Method not found");
      }
    } catch (error) {
      sendError(null, -32700, "Parse error");
    }
  });

  // Helper function for CRUD operations
  async function handleCrudOperation(
    operation: string,
    table: string,
    data?: any,
    where?: any
  ) {
    switch (operation.toLowerCase()) {
      case "select":
        if (table === "subjects") {
          return await prisma.subject.findMany(where ? { where } : undefined);
        }
        const selectWhereClause = where
          ? `WHERE ${Object.keys(where)
              .map((key, i) => `${key} = $${i + 1}`)
              .join(" AND ")}`
          : "";
        const selectValues = where ? Object.values(where) : [];
        return await prisma.$queryRawUnsafe(
          `SELECT * FROM ${table} ${selectWhereClause}`,
          ...selectValues
        );

      case "insert":
        if (table === "subjects") {
          return await prisma.subject.create({
            data: {
              ...data,
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date(),
            },
          });
        }
        const insertColumns = Object.keys(data).join(", ");
        const insertPlaceholders = Object.keys(data)
          .map((_, i) => `$${i + 1}`)
          .join(", ");
        const insertValues = Object.values(data);
        return await prisma.$queryRawUnsafe(
          `INSERT INTO ${table} (${insertColumns}) VALUES (${insertPlaceholders}) RETURNING *`,
          ...insertValues
        );

      case "update":
        if (table === "subjects") {
          return await prisma.subject.updateMany({
            where,
            data: {
              ...data,
              updatedAt: new Date(),
            },
          });
        }
        const updateSetClause = Object.keys(data)
          .map((key, i) => `${key} = $${i + 1}`)
          .join(", ");
        const updateWhereClause = where
          ? `WHERE ${Object.keys(where)
              .map((key, i) => `${key} = $${Object.keys(data).length + i + 1}`)
              .join(" AND ")}`
          : "";
        const updateValues = [
          ...Object.values(data),
          ...(where ? Object.values(where) : []),
        ];
        return await prisma.$queryRawUnsafe(
          `UPDATE ${table} SET ${updateSetClause} ${updateWhereClause} RETURNING *`,
          ...updateValues
        );

      case "delete":
        if (table === "subjects") {
          return await prisma.subject.deleteMany({ where });
        }
        const deleteWhereClause = where
          ? `WHERE ${Object.keys(where)
              .map((key, i) => `${key} = $${i + 1}`)
              .join(" AND ")}`
          : "";
        const deleteValues = where ? Object.values(where) : [];
        return await prisma.$queryRawUnsafe(
          `DELETE FROM ${table} ${deleteWhereClause} RETURNING *`,
          ...deleteValues
        );

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  function sendResponse(id: any, result: any) {
    const response = {
      jsonrpc: "2.0",
      id,
      result,
    };
    stdout.write(JSON.stringify(response) + "\n");
  }

  function sendError(id: any, code: number, message: string) {
    const response = {
      jsonrpc: "2.0",
      id,
      error: { code, message },
    };
    stdout.write(JSON.stringify(response) + "\n");
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(console.error);
