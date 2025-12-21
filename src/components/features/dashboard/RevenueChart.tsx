/**
 * Composant RevenueChart
 * 
 * Graphique en ligne montrant l'évolution des revenus.
 * Utilise Recharts pour le rendu.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatPrice } from '@/lib/utils';

// ==========================================
// TYPES
// ==========================================

interface RevenueData {
  month: string;
  revenue: number;
  count?: number;
}

interface RevenueChartProps {
  /** Données du graphique */
  data: RevenueData[];
  /** Titre du graphique */
  title?: string;
  /** Type de graphique */
  variant?: 'line' | 'area';
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// TOOLTIP PERSONNALISÉ
// ==========================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {entry.dataKey === 'revenue' ? 'Revenus' : 'RDV'}: {' '}
          <span className="font-medium text-foreground">
            {entry.dataKey === 'revenue' ? formatPrice(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ==========================================
// COMPOSANT
// ==========================================

export function RevenueChart({
  data,
  title = 'Revenus par mois',
  variant = 'area',
  className,
}: RevenueChartProps) {
  const ChartComponent = variant === 'area' ? AreaChart : LineChart;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#12B2C1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#12B2C1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip content={<CustomTooltip />} />
              {variant === 'area' ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#12B2C1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#12B2C1"
                  strokeWidth={2}
                  dot={{ fill: '#12B2C1', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
