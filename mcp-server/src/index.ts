import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "ERP MCP Server",
  });
});

// ========================================
// LANGFLOW WRAPPER ENDPOINTS
// ========================================

// Wrapper for SQL queries - LangFlow compatible
app.post("/api/langflow/query", async (req, res) => {
  try {
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required",
        data: null
      });
    }

    // Execute query
    const result = await prisma.$queryRawUnsafe(query, ...params);
    
    // Convert BigInt and format for LangFlow
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // LangFlow compatible response format
    res.json({
      success: true,
      data: serializedResult,
      message: `Query executed successfully. Returned ${serializedResult.length} rows.`,
      timestamp: new Date().toISOString(),
      query: query
    });
  } catch (error) {
    console.error("LangFlow Query Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// Wrapper for CRUD operations - LangFlow compatible
app.post("/api/langflow/crud", async (req, res) => {
  try {
    const { operation, table, data, where } = req.body;

    if (!operation || !table) {
      return res.status(400).json({
        success: false,
        error: "Operation and table are required",
        data: null
      });
    }

    const result = await handleCrudOperation(operation, table, data, where);
    
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({
      success: true,
      data: serializedResult,
      message: `${operation.toUpperCase()} operation on ${table} completed successfully`,
      operation,
      table,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("LangFlow CRUD Error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// Simplified schema endpoint for LangFlow
app.get("/api/langflow/schema/:table?", async (req, res) => {
  try {
    const { table } = req.params;
    
    let result;
    if (table) {
      // Get specific table schema
      result = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, table);
    } else {
      // Get all tables
      result = await prisma.$queryRawUnsafe(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
    }

    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({
      success: true,
      data: serializedResult,
      message: table ? `Schema for table ${table}` : "All database tables",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("LangFlow Schema Error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
});

// ========================================
// TOOL DEFINITION ENDPOINTS
// ========================================

// LangFlow Tool Definitions
app.get("/api/tools/definitions", async (req, res) => {
  const toolDefinitions = [
    {
      name: "query_database",
      description: "Execute raw SQL queries on the ERP database",
      endpoint: "/api/langflow/query",
      method: "POST",
      parameters: {
        query: {
          type: "string",
          required: true,
          description: "SQL query to execute"
        },
        params: {
          type: "array",
          required: false,
          description: "Query parameters",
          default: []
        }
      },
      example: {
        query: "SELECT * FROM students WHERE grade = $1",
        params: ["A"]
      }
    },
    {
      name: "crud_operations",
      description: "Perform CRUD operations on database tables",
      endpoint: "/api/langflow/crud",
      method: "POST", 
      parameters: {
        operation: {
          type: "string",
          required: true,
          enum: ["select", "insert", "update", "delete"],
          description: "CRUD operation type"
        },
        table: {
          type: "string",
          required: true,
          description: "Database table name"
        },
        data: {
          type: "object",
          required: false,
          description: "Data for INSERT/UPDATE operations"
        },
        where: {
          type: "object", 
          required: false,
          description: "WHERE conditions"
        }
      },
      example: {
        operation: "select",
        table: "students",
        where: { grade: "A" }
      }
    },
    {
      name: "get_schema",
      description: "Get database schema information",
      endpoint: "/api/langflow/schema",
      method: "GET",
      parameters: {
        table: {
          type: "string",
          required: false,
          description: "Specific table name (optional)"
        }
      },
      example: {
        table: "students"
      }
    }
  ];

  res.json({
    success: true,
    tools: toolDefinitions,
    count: toolDefinitions.length,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// UTILITY ENDPOINTS
// ========================================

// Test connection endpoint
app.get("/api/test/connection", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    res.json({
      success: true,
      message: "Database connection successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Quick query builder endpoint
app.post("/api/query/builder", async (req, res) => {
  try {
    const { table, columns = ["*"], where, limit, orderBy } = req.body;
    
    if (!table) {
      return res.status(400).json({
        success: false,
        error: "Table name is required"
      });
    }

    let query = `SELECT ${columns.join(", ")} FROM ${table}`;
    let params = [];
    let paramIndex = 1;

    // Add WHERE conditions
    if (where && Object.keys(where).length > 0) {
      const whereConditions = Object.keys(where).map(key => {
        params.push(where[key]);
        return `${key} = $${paramIndex++}`;
      });
      query += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add ORDER BY
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    // Add LIMIT
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const result = await prisma.$queryRawUnsafe(query, ...params);
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({
      success: true,
      data: serializedResult,
      query,
      params,
      count: serializedResult.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// ========================================
// ORIGINAL MCP ENDPOINTS (PRESERVED)
// ========================================

// MCP Query endpoint - Execute raw SQL queries
app.post("/api/mcp/query", async (req, res) => {
  try {
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required",
      });
    }

    // Execute the query
    const result = await prisma.$queryRawUnsafe(query, ...params);

    // Convert BigInt values to strings to avoid JSON serialization issues
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({
      success: true,
      data: serializedResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Query execution error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || "Query execution failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// MCP Schema endpoint - Get database schema information
app.get("/api/mcp/schema", async (req, res) => {
  try {
    // Get all tables and their structures
    const tables = await prisma.$queryRaw`
      SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
      WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;
    `;

    res.json({
      success: true,
      data: tables,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Schema query error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve schema",
      timestamp: new Date().toISOString(),
    });
  }
});

// MCP Tables endpoint - Get list of all tables
app.get("/api/mcp/tables", async (req, res) => {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    res.json({
      success: true,
      data: tables,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Tables query error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || "Failed to retrieve tables",
      timestamp: new Date().toISOString(),
    });
  }
});

// MCP Execute endpoint - Execute predefined operations
app.post("/api/mcp/execute", async (req, res) => {
  try {
    const { operation, table, data, where } = req.body;

    if (!operation || !table) {
      return res.status(400).json({
        success: false,
        error: "Operation and table parameters are required",
      });
    }

    let result;
    const tableName = table.toLowerCase();

    switch (operation.toLowerCase()) {
      case "select":
        if (where) {
          // Build dynamic WHERE clause
          const whereClause = Object.keys(where)
            .map((key) => `${key} = $${Object.keys(where).indexOf(key) + 1}`)
            .join(" AND ");
          const values = Object.values(where);
          result = await prisma.$queryRawUnsafe(
            `SELECT * FROM ${tableName} WHERE ${whereClause}`,
            ...values
          );
        } else {
          result = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName}`);
        }
        break;

      case "insert":
        if (!data) {
          return res.status(400).json({
            success: false,
            error: "Data parameter is required for insert operation",
          });
        }
        // Use Prisma client for type-safe operations
        const modelName =
          tableName.charAt(0).toUpperCase() +
          tableName.slice(1).replace(/s$/, ""); // Convert table name to model name
        if (modelName === "Subject") {
          result = await prisma.subject.create({
            data: {
              ...data,
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date(),
            },
          });
        } else {
          // For other tables, use raw SQL as fallback
          let columns = Object.keys(data).join(", ");
          let placeholders = Object.keys(data)
            .map((_, i) => `$${i + 1}`)
            .join(", ");
          let values = Object.values(data);
          // For INSERT, we need to handle createdAt and updatedAt timestamps
          if (!data.createdAt) {
            columns += ', "createdAt"';
            placeholders += ", NOW()";
          }
          if (!data.updatedAt) {
            columns += ', "updatedAt"';
            placeholders += ", NOW()";
          }
          result = await prisma.$queryRawUnsafe(
            `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
            ...values
          );
        }
        break;

      case "update":
        if (!data || !where) {
          return res.status(400).json({
            success: false,
            error:
              "Data and where parameters are required for update operation",
          });
        }
        const setClause = Object.keys(data)
          .map((key) => `${key} = $${Object.keys(data).indexOf(key) + 1}`)
          .join(", ");
        const whereClause = Object.keys(where)
          .map(
            (key) =>
              `${key} = $${
                Object.keys(data).length + Object.keys(where).indexOf(key) + 1
              }`
          )
          .join(" AND ");
        const allValues = [...Object.values(data), ...Object.values(where)];
        result = await prisma.$queryRawUnsafe(
          `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause} RETURNING *`,
          ...allValues
        );
        break;

      case "delete":
        if (!where) {
          return res.status(400).json({
            success: false,
            error: "Where parameter is required for delete operation",
          });
        }
        const deleteWhereClause = Object.keys(where)
          .map((key) => `${key} = $${Object.keys(where).indexOf(key) + 1}`)
          .join(" AND ");
        const deleteValues = Object.values(where);
        result = await prisma.$queryRawUnsafe(
          `DELETE FROM ${tableName} WHERE ${deleteWhereClause} RETURNING *`,
          ...deleteValues
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid operation. Supported: select, insert, update, delete",
        });
    }

    // Convert BigInt values to strings to avoid JSON serialization issues
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({
      success: true,
      data: serializedResult,
      operation,
      table,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Execute operation error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || "Operation execution failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug endpoints
app.get("/debug/tools", async (req, res) => {
  const tools = [
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
            items: { type: "string" },
            description: "Query parameters",
          },
        },
        required: ["query"],
      },
    },
  ];

  res.json({ tools });
});

// Also expose the same debug tools over POST
app.post("/mcp/debug/tools", async (req, res) => {
  const tools = [
    {
      name: "query_database",
      description: "Execute raw SQL queries on the ERP database",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "SQL query to execute" },
          params: {
            type: "array",
            items: { type: "string" },
            description: "Query parameters",
          },
        },
        required: ["query"],
      },
    },
  ];

  res.json({ tools });
});

// Error handling middleware
app.use(
  (
    err:any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
);

// MCP Protocol endpoint - JSON-RPC 2.0
app.post("/mcp", async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    if (jsonrpc !== "2.0") {
      return res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32600, message: "Invalid Request" },
      });
    }

    switch (method) {
      case "initialize":
        // Required MCP initialization
        res.json({
          jsonrpc: "2.0",
          id,
          result: {
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
          },
        });
        break;

      case "tools/list":
        // Return list of available tools
        res.json({
          jsonrpc: "2.0",
          id,
          result: {
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
                      description: "Query parameters",
                    },
                  },
                  required: ["query"],
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
          },
        });
        break;

      case "tools/call":
        const { name, arguments: args } = params;

        try {
          let result;

          switch (name) {
            case "query_database":
              result = await prisma.$queryRawUnsafe(
                args.query,
                ...(args.params || [])
              );
              // Convert BigInt to string for JSON serialization
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

          res.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
          });
        } catch (error) {
          res.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32603,
              message: (error as Error).message || "Internal error",
            },
          });
        }
        break;

      default:
        res.status(400).json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" },
        });
    }
  } catch (error) {
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body.id,
      error: { code: -32603, message: "Internal error" },
    });
  }
});

// Helper function for CRUD operations
async function handleCrudOperation(
  operation,
  table,
  data,
  where
) {
  switch (operation.toLowerCase()) {
    case "select":
      if (table === "subjects") {
        return await prisma.subject.findMany(where ? { where } : undefined);
      }
      // For other tables, use raw query
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
      // For other tables, use raw query
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
      // For other tables, use raw query
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
      // For other tables, use raw query
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

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on port ${PORT}`);
  console.log(`📊 Database connected via Prisma`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🛠️  LangFlow tools: http://localhost:${PORT}/api/tools/definitions`);
  console.log(`🔧 Test connection: http://localhost:${PORT}/api/test/connection`);
});
