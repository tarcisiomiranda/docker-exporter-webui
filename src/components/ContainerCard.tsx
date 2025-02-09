
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContainerCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  status?: "running" | "stopped";
}

export function ContainerCard({ title, value, icon, status }: ContainerCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {status && (
            <div
              className={`px-2 py-1 text-xs rounded-full ${
                status === "running"
                  ? "bg-success/20 text-success"
                  : "bg-error/20 text-error"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
