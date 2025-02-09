
import Graph from "react-graph-vis";
import { useEffect, useState } from "react";

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  instance: string;
}

interface ContainerGraphProps {
  containers: Container[];
}

export function ContainerGraph({ containers }: ContainerGraphProps) {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    const containersByHost = containers.reduce((acc, container) => {
      if (!acc[container.instance]) {
        acc[container.instance] = [];
      }
      acc[container.instance].push(container);
      return acc;
    }, {} as Record<string, Container[]>);

    const hostNodes = Object.keys(containersByHost).map((instance) => ({
      id: `host-${instance}`,
      label: `Host ${instance}`,
      color: "#8B5CF6",
      shape: "hexagon",
      size: 30,
      title: `Instance: ${instance}\nContainers: ${containersByHost[instance].length}`,
    }));

    const containerNodes = containers.map((container) => ({
      id: container.id,
      label: container.name,
      title: `Image: ${container.image}\nInstance: ${container.instance}`,
      color: container.status === "running" ? "#10B981" : "#EF4444",
      shape: "box",
    }));

    const edges = containers.map((container) => ({
      from: `host-${container.instance}`,
      to: container.id,
      length: 200,
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5,
        },
      },
    }));

    setGraph({
      nodes: [...hostNodes, ...containerNodes],
      edges: edges,
    });
  }, [containers]);

  const options = {
    layout: {
      hierarchical: false,
    },
    nodes: {
      font: {
        size: 16,
      },
    },
    edges: {
      color: "#64748B",
      width: 2,
    },
    physics: {
      stabilization: true,
      barnesHut: {
        gravitationalConstant: -4000,
        springConstant: 0.001,
        springLength: 200,
      },
    },
    height: "500px",
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-lg font-semibold mb-4">Container Network Graph</h3>
      <Graph graph={graph} options={options} />
    </div>
  );
}
