import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, GitBranch, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface GenomeScan {
  id: string;
  branch: string;
  scan_type: string;
  efficiency_score: number | null;
  created_at: string;
  scan_duration_ms: number | null;
}

interface GenomeTimelineProps {
  scans: GenomeScan[];
  onCompare?: (scanId1: string, scanId2: string) => void;
  onSelectScan?: (scanId: string) => void;
}

export const GenomeTimeline = ({ scans, onCompare, onSelectScan }: GenomeTimelineProps) => {
  const sortedScans = [...scans].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getScoreTrend = (index: number) => {
    if (index >= sortedScans.length - 1) return null;
    const current = sortedScans[index].efficiency_score;
    const previous = sortedScans[index + 1].efficiency_score;
    if (!current || !previous) return null;
    return current - previous;
  };

  const getScanTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'default';
      case 'incremental': return 'secondary';
      case 'diff': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Scan History</h3>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {sortedScans.map((scan, index) => {
            const trend = getScoreTrend(index);
            return (
              <div
                key={scan.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onSelectScan?.(scan.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{scan.branch}</span>
                    <Badge variant={getScanTypeColor(scan.scan_type)}>
                      {scan.scan_type}
                    </Badge>
                  </div>
                  {scan.efficiency_score !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{scan.efficiency_score}</span>
                      {trend !== null && (
                        <div className="flex items-center gap-1">
                          {trend > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : trend < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : null}
                          <span className={`text-sm ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : ''}`}>
                            {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(scan.created_at), 'PPp')}
                  </div>
                  {scan.scan_duration_ms && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {(scan.scan_duration_ms / 1000).toFixed(2)}s
                    </div>
                  )}
                </div>

                {index < sortedScans.length - 1 && onCompare && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompare(scan.id, sortedScans[index + 1].id);
                    }}
                  >
                    Compare with previous
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};