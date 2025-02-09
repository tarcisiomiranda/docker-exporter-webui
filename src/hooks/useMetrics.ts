
import { useState, useEffect } from "react";
import { MetricsData, Container, MetricDataPoint } from "@/types/metrics";

const PROMETHEUS_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/query`;

export function useMetrics() {
  const [data, setData] = useState<MetricsData>({
    containers: [],
    memoryUsage: [],
    cpuUsage: [],
  });

  const fetchMetrics = async () => {
    try {
      const statusResponse = await fetch(
        `${PROMETHEUS_URL}?query=container_status`
      );
      const statusData = await statusResponse.json();

      const imageResponse = await fetch(
        `${PROMETHEUS_URL}?query=container_image`
      );
      const imageData = await imageResponse.json();

      const uptimeResponse = await fetch(
        `${PROMETHEUS_URL}?query=container_uptime_seconds`
      );
      const uptimeData = await uptimeResponse.json();

      // Updated CPU query
      const cpuResponse = await fetch(
        `${PROMETHEUS_URL}?query=sum(rate(process_cpu_seconds_total[1m])) by (instance)`
      );
      const cpuData = await cpuResponse.json();

      // Updated memory query
      const memoryResponse = await fetch(
        `${PROMETHEUS_URL}?query=sum(process_resident_memory_bytes) by (instance)`
      );
      const memoryData = await memoryResponse.json();

      const timestamp = Date.now();
      
      const containers = statusData.data?.result?.map((result: any) => {
        const name = result.metric.container_name;
        const instance = result.metric.instance;
        
        const uptimeResult = uptimeData.data?.result?.find(
          (u: any) => 
            u.metric.container_name === name && 
            u.metric.instance === instance
        );
        
        const imageResult = imageData.data?.result?.find(
          (i: any) => 
            i.metric.container_name === name && 
            i.metric.instance === instance
        );

        return {
          id: result.metric.container_id || name,
          name: name,
          image: imageResult ? imageResult.metric.image : "",
          status: result.value[1] === "1" ? "running" : "stopped",
          uptime: uptimeResult ? parseFloat(uptimeResult.value[1]) : 0,
          instance: instance,
        };
      }) || [];

      const uniqueInstances = [...new Set(containers.map(c => c.instance))];
      const dataPointsPerInstance = 20;

      const memoryMetrics = memoryData.data?.result?.map((result: any) => ({
        timestamp,
        instance: result.metric.instance,
        // Convert bytes to MB
        value: parseFloat(result.value[1]) / (1024 * 1024),
      })) || [];

      const cpuMetrics = cpuData.data?.result?.map((result: any) => ({
        timestamp,
        instance: result.metric.instance,
        // Convert to percentage
        value: parseFloat(result.value[1]) * 100,
      })) || [];

      setData((prev) => {
        const maxDataPoints = uniqueInstances.length * dataPointsPerInstance;
        return {
          containers,
          memoryUsage: [...prev.memoryUsage, ...memoryMetrics].slice(-maxDataPoints),
          cpuUsage: [...prev.cpuUsage, ...cpuMetrics].slice(-maxDataPoints),
        };
      });
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
