# MCP stdio Agent Instructions

This document contains a concise instruction prompt and examples for an agent that will communicate with the MCP stdio server (JSON-RPC over stdin/stdout) implemented in this repository (`dist/stdio-server.js`).

Use this as the agent's operational rules: how to initialize, discover tools, call tools safely, parse results, and handle errors.

---

## Goals

- Initialize the MCP connection and discover available tools.
- Validate schema/tables before running queries.
- Prefer parameterized queries and structured CRUD calls.
- Never perform destructive operations without explicit user confirmation.
- Parse results safely and handle BigInt values returned as strings.

---

## Workflow

1. Send JSON-RPC `initialize`.
2. Call `tools/list` to discover available tools.
3. Call `get_schema` / `list_tables` before building queries to validate table/column names.
4. Use `query_database` (parameterized) for ad-hoc SQL and `execute_crud` for structured operations.
5. Parse `result.content[0].text` (JSON string) and convert BigInt strings only when safe.
6. Log queries, enforce timeouts, and require explicit confirmations for destructive actions.

---

## JSON-RPC Examples

### Initialize

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": { "name": "agent", "version": "1.0" }
  }
}
```

### Get available tools

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

### List tables (tools/call)

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_tables",
    "arguments": {}
  }
}
```

### Describe a table

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_schema",
    "arguments": { "table": "users" }
  }
}
```

### Safe SELECT using `query_database`

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "query_database",
    "arguments": {
      "query": "SELECT id, email, role FROM users WHERE role = $1 LIMIT 100",
      "params": ["STUDENT"]
    }
  }
}
```

### Structured INSERT using `execute_crud`

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "execute_crud",
    "arguments": {
      "operation": "insert",
      "table": "subjects",
      "data": { "code": "MATH101", "name": "Mathematics I" }
    }
  }
}
```

---

## Response handling (expected format)

- Server responses look like:

```json
{"jsonrpc":"2.0","id":5,"result":{"content":[{"type":"text","text":"[ ... JSON ... ]"}]}}
```

Agent should:
1. Extract `result.content[0].text`.
2. `JSON.parse()` the text.
3. Convert BigInt-like strings carefully (do not automatically cast to Number if value may exceed safe integer).
4. Return structured data to the user.

If the response contains an `error` object, surface its `message` and `code` to the user and do not retry destructive operations automatically.

---

## Error handling

- If server returns an `error` object, log it and return a concise error to the user (include `code` and `message`).
- If parsing fails, return: `Parse error — raw text: <text>`.
- For query failures, include the server message but avoid retrying destructive commands without explicit confirmation.

---

## Security and Safety Rules

- Validate table and column names returned from `get_schema` before interpolating into SQL.
- Always use parameterized queries (`$1`, `$2`, ...) for dynamic values.
- Add a reasonable `LIMIT` (e.g., 100) for queries that could return many rows unless the user explicitly requests otherwise.
- Require explicit user confirmation for `INSERT`, `UPDATE`, `DELETE`, or any DDL statements.
- Never expose `DATABASE_URL` or other secrets in logs or outputs.

---

## Short checklist per action

1. `tools/list` -> confirm requested tool exists.
2. `get_schema` / `list_tables` -> validate table/columns.
3. Build a parameterized call (`query_database`) or structured call (`execute_crud`).
4. Send `tools/call` JSON-RPC request.
5. Parse `result.content[0].text` with `JSON.parse()`.
6. Normalize BigInt strings if necessary.
7. Return sanitized result to user.

---

## Notes for Langflow integration

- Langflow typically launches the MCP process via stdio. If you provide a command to Langflow that expects relative paths, use the absolute path to the executable or wrapper script (for example `D:\Hacksters\ERP\mcp-server\mcp-server.bat`), or configure the command to `node dist/stdio-server.js` with the full path to `dist`.
- Make sure the `DATABASE_URL` environment variable provided to Langflow is reachable from where Langflow runs (use `localhost` for same-host, `postgres` for same-docker-network, or an external host if remote).

---

## Example safety policy snippet (agent must follow)

- "Do not run any destructive SQL without explicit user confirmation."
- "Validate every table/column name against `get_schema` before using it in a SQL string."
- "Limit result sets by default."

---

End of instructions. Save this file into the MCP server repository and point your Langflow MCP component to run the stdio server (`dist/stdio-server.js`) using an absolute path or wrapper script.
