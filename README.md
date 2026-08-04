# mcp-bcrp-pe

Banco Central de Reserva del Perú (BCRP) statistics series API MCP. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Bcrp Pe data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
