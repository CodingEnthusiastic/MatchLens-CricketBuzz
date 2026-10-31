import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MatchTimelineEntry } from '../../types/match';

const AXIS_TICK = { fill: '#94A3B8', fontSize: 11 };
const GRID_STROKE = '#1E2B45';
const LIME = '#C7F36B';
const SKY = '#65B8FF';
const WICKET = '#FF6868';

const tooltipStyle = {
  background: '#172338',
  border: '1px solid #1E2B45',
  borderRadius: 6,
  fontSize: 12,
  color: '#E6EDF7',
};

export function ScoringProgressChart({ overs }: { overs: MatchTimelineEntry[] }) {
  const data = overs.map((entry) => ({
    over: entry.over,
    runs: entry.cumulative_runs,
    pace: entry.target_pace,
  }));

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LIME} stopOpacity={0.22} />
            <stop offset="100%" stopColor={LIME} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="over" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => `Ov ${v}`} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => `After over ${value}`}
          formatter={(value, name) => [value, name === 'runs' ? 'Team runs' : 'Pace to target']}
        />
        <Area type="monotone" dataKey="runs" stroke={LIME} strokeWidth={2} fill="url(#scoreFill)" dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="pace" stroke={SKY} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OverRunsChart({ overs }: { overs: MatchTimelineEntry[] }) {
  const data = overs.map((entry) => ({ over: entry.over, runs: entry.runs, wickets: entry.wickets }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barCategoryGap="28%">
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="over" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          contentStyle={tooltipStyle}
          labelFormatter={(value) => `Over ${value}`}
          formatter={(value, name) => [value, name === 'runs' ? 'Runs' : 'Wickets']}
        />
        <Bar dataKey="runs" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.over} fill={entry.wickets > 0 ? WICKET : SKY} fillOpacity={entry.wickets > 0 ? 0.9 : 0.55} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
