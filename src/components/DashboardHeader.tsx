
import { Moon, Share2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Docker Export Web</h1>
        <p className="text-muted-foreground">
          Metrics are retrieved from Docker Export's Prometheus.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button onClick={() => navigate("/network")} className="gap-2">
          <Share2 className="h-4 w-4" />
          Network Graph
        </Button>
      </div>
    </div>
  );
}
