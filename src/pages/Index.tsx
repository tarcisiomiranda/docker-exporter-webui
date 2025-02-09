
import { ContainerList } from "@/components/ContainerList";
import { MetricsChart } from "@/components/MetricsChart";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsOverview } from "@/components/StatsOverview";
import { useMetrics } from "@/hooks/useMetrics";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const data = useMetrics();
  const [selectedHost, setSelectedHost] = useState<string>("all");

  const uniqueHosts = [...new Set([
    ...data.memoryUsage.map(d => d.instance),
    ...data.cpuUsage.map(d => d.instance)
  ])];

  const filteredMemoryData = selectedHost === "all"
    ? data.memoryUsage
    : data.memoryUsage.filter(d => d.instance === selectedHost);

  const filteredCpuData = selectedHost === "all"
    ? data.cpuUsage
    : data.cpuUsage.filter(d => d.instance === selectedHost);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex flex-col space-y-8">
        <DashboardHeader />
        <StatsOverview containers={data.containers} />

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Containers</h2>
          <ContainerList containers={data.containers} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold tracking-tight">Metrics</h2>
            <Select value={selectedHost} onValueChange={setSelectedHost}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a host to filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hosts</SelectItem>
                {uniqueHosts.map((host) => (
                  <SelectItem key={host} value={host}>
                    {host}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricsChart
              title="Memory Usage (MB)"
              data={filteredMemoryData}
              valueSuffix=" MB"
            />
            <MetricsChart
              title="CPU Usage"
              data={filteredCpuData}
              valueSuffix="%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
