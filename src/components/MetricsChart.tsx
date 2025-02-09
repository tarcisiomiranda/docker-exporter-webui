
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricDataPoint {
  timestamp: number;
  instance: string;
  value: number;
}

interface MetricsChartProps {
  title: string;
  data: Array<MetricDataPoint>;
  valueSuffix?: string;
}

export function MetricsChart({ title, data, valueSuffix = "" }: MetricsChartProps) {
  const chartData = data.reduce((acc: any[], curr) => {
    const existingPoint = acc.find(p => p.timestamp === curr.timestamp);
    if (existingPoint) {
      existingPoint[curr.instance] = curr.value;
    } else {
      const newPoint = { timestamp: curr.timestamp };
      newPoint[curr.instance] = curr.value;
      acc.push(newPoint);
    }
    return acc;
  }, []);

  const instances = [...new Set(data.map(d => d.instance))];

  const getLineColor = (index: number) => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "#10B981", // green
      "#6366F1", // indigo
      "#F59E0B", // amber
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${value}${valueSuffix}`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}${valueSuffix}`,
                  name,
                ]}
              />
              <Legend />
              {instances.map((instance, index) => (
                <Line
                  key={instance}
                  type="monotone"
                  dataKey={instance}
                  name={instance}
                  strokeWidth={2}
                  dot={false}
                  stroke={getLineColor(index)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
