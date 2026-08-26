# mcp-bcrp-pe

Banco Central de Reserva del Perú (BCRP) statistics series API MCP. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_series` | Time-series data from the Banco Central de Reserva del Perú (BCRP) statistics API. Pass one or more BCRP series codes joined with "-" (all must share the same frequency). Returns the series names plus aligned period/value rows. Well-known codes (verified live): PD04722MM = monetary policy reference rate (monthly %); PD04638PD = interbank exchange rate S/ per US$, sell (daily); PD04640PD = banking-system (SBS) exchange rate S/ per US$, sell (daily); PN01273PM = Lima CPI, 12-month % change / annual inflation (monthly); PM04863AA = GDP, real % change (annual). Code suffix encodes frequency: ...PD/...PD = daily, ...PM/...MM = monthly, ...AA = annual. Browse more codes at https://estadisticas.bcrp.gob.pe. Optional start/end use the period format for that frequency: daily YYYY-M-D (2026-5-28), monthly YYYY-M (2026-5), annual YYYY (2024). lang is "ing" (English, default) or "esp" (Spanish). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "bcrp-pe": {
      "url": "https://gateway.pipeworx.io/bcrp-pe/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/bcrp-pe/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Bcrp Pe data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
