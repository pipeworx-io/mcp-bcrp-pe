interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Banco Central de Reserva del Perú (BCRP) statistics series API MCP. Keyless.
 *
 * API base: https://estadisticas.bcrp.gob.pe/estadisticas/series/api
 *
 * Series-code format (suffix encodes frequency):
 *   PD...PD  daily    — period names like "28.May.26"; date args YYYY-M-D (e.g. 2026-5-28)
 *   PN...PM / PD...MM  monthly — period names like "May.2026"; date args YYYY-M (e.g. 2026-5)
 *   PM...AA  annual   — period names like "2024"; date args YYYY (e.g. 2024)
 * Multiple series are joined with '-' (e.g. "PD04638PD-PD04640PD") but they MUST share the same
 * frequency — mixing frequencies silently drops series and returns no data.
 * Series codes come from the BCRP statistics website: https://estadisticas.bcrp.gob.pe
 */


const BASE = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api';
const UA = 'pipeworx-mcp-bcrp-pe/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_series',
    description:
      'Time-series data from the Banco Central de Reserva del Perú (BCRP) statistics API. Pass one or more BCRP ' +
      'series codes joined with "-" (all must share the same frequency). Returns the series names plus aligned ' +
      'period/value rows. Well-known codes (verified live): PD04722MM = monetary policy reference rate (monthly %); ' +
      'PD04638PD = interbank exchange rate S/ per US$, sell (daily); PD04640PD = banking-system (SBS) exchange rate ' +
      'S/ per US$, sell (daily); PN01273PM = Lima CPI, 12-month % change / annual inflation (monthly); ' +
      'PM04863AA = GDP, real % change (annual). Code suffix encodes frequency: ...PD/...PD = daily, ' +
      '...PM/...MM = monthly, ...AA = annual. Browse more codes at https://estadisticas.bcrp.gob.pe. ' +
      'Optional start/end use the period format for that frequency: daily YYYY-M-D (2026-5-28), monthly YYYY-M ' +
      '(2026-5), annual YYYY (2024). lang is "ing" (English, default) or "esp" (Spanish).',
    inputSchema: {
      type: 'object',
      properties: {
        series: {
          type: 'string',
          description:
            'One or more BCRP series codes joined with "-", e.g. "PD04722MM" or "PD04638PD-PD04640PD". ' +
            'All joined codes must share the same frequency.',
        },
        start: {
          type: 'string',
          description:
            'Start period in the frequency\'s format: daily YYYY-M-D, monthly YYYY-M, annual YYYY. Omit for full history.',
        },
        end: {
          type: 'string',
          description: 'End period, same format as start. Requires start. Omit for latest.',
        },
        lang: {
          type: 'string',
          enum: ['ing', 'esp'],
          description: 'Response language: "ing" (English, default) or "esp" (Spanish).',
        },
      },
      required: ['series'],
    },
  },
];

interface BcrpResponse {
  config?: {
    title?: string;
    series?: Array<{ name?: string; dec?: string }>;
  };
  periods?: Array<{ name?: string; values?: string[] }>;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_series': {
      const series = reqStr(args, 'series', '"PD04722MM" or "PD04638PD-PD04640PD"').trim();
      const lang = args.lang === 'esp' ? 'esp' : 'ing';
      const start = (args.start as string | undefined)?.trim();
      const end = (args.end as string | undefined)?.trim();

      let path = `/${encodeURIComponent(series)}/json`;
      if (start) {
        path += `/${encodeURIComponent(start)}/${encodeURIComponent(end || start)}/${lang}`;
      } else {
        path += `/${lang}`;
      }

      const data = (await bcrpGet(path)) as BcrpResponse;
      const seriesNames = (data.config?.series ?? []).map((s) => s.name).filter((n): n is string => !!n);
      const periods = (data.periods ?? []).map((p) => ({ period: p.name, values: p.values ?? [] }));
      return {
        title: data.config?.title,
        series: seriesNames,
        periods,
        count: periods.length,
        ...(periods.length === 0
          ? {
              note:
                'No data points returned. The series may be discontinued, the requested period window may be ' +
                'empty/out of range, or joined codes may not share the same frequency.',
            }
          : {}),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function bcrpGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  const body = await res.text();
  if (!res.ok) throw new Error(`BCRP: ${res.status} ${body.slice(0, 200)}`);
  // BCRP returns HTTP 200 with an HTML stub for unknown/invalid series codes, so guard on the payload.
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error(
      `BCRP: 200 but non-JSON response — likely an unknown series code. ` +
        `Verify codes at https://estadisticas.bcrp.gob.pe. ${body.slice(0, 200)}`,
    );
  }
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
