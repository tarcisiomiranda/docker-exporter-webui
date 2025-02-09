
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  uptime: number;
  instance: string;
}

interface ContainerListProps {
  containers: Container[];
}

export function ContainerList({ containers }: ContainerListProps) {
  const [sortField, setSortField] = useState<keyof Container | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [instanceFilter, setInstanceFilter] = useState<string>("all");

  const handleSort = (field: keyof Container) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const uniqueInstances = Array.from(new Set(containers.map(c => c.instance)));

  const filteredContainers = containers.filter(container => {
    const matchesStatus = statusFilter === "all" || container.status === statusFilter;
    const matchesInstance = instanceFilter === "all" || container.instance === instanceFilter;
    return matchesStatus && matchesInstance;
  });

  const sortedContainers = [...filteredContainers].sort((a, b) => {
    if (!sortField) return 0;

    let compareA = a[sortField];
    let compareB = b[sortField];

    if (sortField === 'uptime') {
      return sortDirection === 'asc' 
        ? a.uptime - b.uptime
        : b.uptime - a.uptime;
    }

    if (typeof compareA === 'string' && typeof compareB === 'string') {
      return sortDirection === 'asc'
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    }

    return 0;
  });

  const getSortIcon = (field: keyof Container) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={instanceFilter} onValueChange={setInstanceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by instance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instances</SelectItem>
              {uniqueInstances.map((instance) => (
                <SelectItem key={instance} value={instance}>
                  {instance}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                onClick={() => handleSort('name')}
                className="cursor-pointer hover:bg-muted/50"
              >
                Name {getSortIcon('name')}
              </TableHead>
              <TableHead 
                onClick={() => handleSort('image')}
                className="cursor-pointer hover:bg-muted/50"
              >
                Image {getSortIcon('image')}
              </TableHead>
              <TableHead 
                onClick={() => handleSort('status')}
                className="cursor-pointer hover:bg-muted/50"
              >
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead 
                onClick={() => handleSort('instance')}
                className="cursor-pointer hover:bg-muted/50"
              >
                Instance {getSortIcon('instance')}
              </TableHead>
              <TableHead 
                onClick={() => handleSort('uptime')}
                className="cursor-pointer hover:bg-muted/50"
              >
                Uptime {getSortIcon('uptime')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContainers.map((container) => (
              <TableRow key={container.id}>
                <TableCell className="font-medium">{container.name}</TableCell>
                <TableCell>{container.image}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      container.status === "running"
                        ? "bg-success/20 text-success"
                        : "bg-error/20 text-error"
                    }`}
                  >
                    {container.status}
                  </span>
                </TableCell>
                <TableCell>{container.instance}</TableCell>
                <TableCell>
                  {formatDistanceToNow(Date.now() - container.uptime * 1000, {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
