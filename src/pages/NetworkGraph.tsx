
import { ContainerGraph } from "@/components/ContainerGraph";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  instance: string;
}

const PROMETHEUS_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/query`;

export default function NetworkGraph() {
  const navigate = useNavigate();
  const [containers, setContainers] = useState<Container[]>([]);

  const fetchContainers = async () => {
    try {
      const statusResponse = await fetch(
        `${PROMETHEUS_URL}?query=container_status`
      );
      const statusData = await statusResponse.json();

      const imageResponse = await fetch(
        `${PROMETHEUS_URL}?query=container_image`
      );
      const imageData = await imageResponse.json();

      const containers = statusData.data?.result?.map((result: any) => {
        const name = result.metric.container_name;
        const imageResult = imageData.data?.result?.find(
          (i: any) => 
            i.metric.container_name === name && 
            i.metric.instance === result.metric.instance
        );

        return {
          id: result.metric.container_id || name,
          name: name,
          image: imageResult ? imageResult.metric.image : "",
          status: result.value[1] === "1" ? "running" : "stopped",
          instance: result.metric.instance
        };
      }) || [];

      setContainers(containers);
    } catch (error) {
      console.error("Failed to fetch containers:", error);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Network Graph</h1>
            <p className="text-muted-foreground">
              Visualize container network relationships
            </p>
          </div>
        </div>
        <ContainerGraph containers={containers} />
      </div>
    </div>
  );
}
