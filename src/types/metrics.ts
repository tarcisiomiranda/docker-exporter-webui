
export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  uptime: number;
  instance: string;
}

export interface MetricDataPoint {
  timestamp: number;
  instance: string;
  value: number;
}

export interface MetricsData {
  containers: Container[];
  memoryUsage: MetricDataPoint[];
  cpuUsage: MetricDataPoint[];
}
