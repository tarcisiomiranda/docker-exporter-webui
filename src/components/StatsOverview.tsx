
import { Box, Clock, Server, Target } from "lucide-react";
import { ContainerCard } from "@/components/ContainerCard";
import { Container } from "@/types/metrics";

interface StatsOverviewProps {
  containers: Container[];
}

export function StatsOverview({ containers }: StatsOverviewProps) {
  const runningContainers = containers.filter(
    (c) => c.status === "running"
  ).length;

  const uniqueTargets = [...new Set(containers.map(c => c.instance))].length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <ContainerCard
        title="Total Containers"
        value={containers.length}
        icon={<Box className="h-4 w-4" />}
      />
      <ContainerCard
        title="Running Containers"
        value={runningContainers}
        icon={<Server className="h-4 w-4" />}
        status="running"
      />
      <ContainerCard
        title="Stopped Containers"
        value={containers.length - runningContainers}
        icon={<Clock className="h-4 w-4" />}
        status="stopped"
      />
      <ContainerCard
        title="Prometheus Targets"
        value={uniqueTargets}
        icon={<Target className="h-4 w-4" />}
      />
    </div>
  );
}
