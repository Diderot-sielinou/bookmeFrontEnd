/**
 * Composant AppointmentChart
 * 
 * Graphique en barres montrant les rendez-vous par jour.
 * Utilise Recharts pour le rendu.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// ==========================================
// TYPES
// ==========================================

interface ChartData {
  date: string;
  count: number;
  revenue?: number;
}

interface AppointmentChartProps {
  /** Données du graphique */
  data: ChartData[];
  /** Titre du graphique */
  title?: string;
  /** Afficher les revenus en plus des RDV */
  showRevenue?: boolean;
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// TOOLTIP PERSONNALISÉ
// ==========================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {entry.name === 'count' ? 'Rendez-vous' : 'Revenus'}: {' '}
          <span className="font-medium text-foreground">
            {entry.name === 'count' ? entry.value : `${entry.value} €`}
          </span>
        </p>
      ))}
    </div>
  );
}

// ==========================================
// COMPOSANT
// ==========================================

export function AppointmentChart({
  data,
  title = 'Rendez-vous par jour',
  showRevenue = false,
  className,
}: AppointmentChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="count"
                fill="#12B2C1"
                radius={[4, 4, 0, 0]}
              />
              {showRevenue && (
                <Bar
                  dataKey="revenue"
                  name="revenue"
                  fill="#0D8A9E"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AppointmentChart;
