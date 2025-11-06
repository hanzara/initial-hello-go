import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare, Plus, Minus, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface DiffResult {
  modules: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  functions: {
    added: number;
    removed: number;
    modified: number;
  };
  complexity: {
    before: number;
    after: number;
    change: number;
  };
  score: {
    before: number;
    after: number;
    change: number;
  };
  vulnerabilities: {
    added: number;
    fixed: number;
  };
}

interface GenomeDiffProps {
  diff: DiffResult;
  baseLabel?: string;
  compareLabel?: string;
}

export const GenomeDiff = ({ diff, baseLabel = "Previous", compareLabel = "Current" }: GenomeDiffProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <GitCompare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Genome Comparison</h3>
        <Badge variant="outline" className="ml-auto">
          {baseLabel} → {compareLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-accent/50">
          <div className="text-sm text-muted-foreground mb-1">Efficiency Score</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{diff.score.before}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-2xl font-bold">{diff.score.after}</span>
            <div className="flex items-center gap-1 ml-auto">
              {diff.score.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : diff.score.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={`font-medium ${diff.score.change > 0 ? 'text-green-500' : diff.score.change < 0 ? 'text-red-500' : ''}`}>
                {diff.score.change > 0 ? '+' : ''}{diff.score.change.toFixed(1)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-accent/50">
          <div className="text-sm text-muted-foreground mb-1">Avg Complexity</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{diff.complexity.before.toFixed(1)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-2xl font-bold">{diff.complexity.after.toFixed(1)}</span>
            <div className="flex items-center gap-1 ml-auto">
              {diff.complexity.change < 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : diff.complexity.change > 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={`font-medium ${diff.complexity.change < 0 ? 'text-green-500' : diff.complexity.change > 0 ? 'text-red-500' : ''}`}>
                {diff.complexity.change > 0 ? '+' : ''}{diff.complexity.change.toFixed(1)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Added Modules ({diff.modules.added.length})
            </h4>
            <div className="space-y-2">
              {diff.modules.added.map((module, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                  <Plus className="h-3 w-3 text-green-500" />
                  <span className="text-sm font-mono">{module}</span>
                </div>
              ))}
            </div>
          </div>

          {diff.modules.removed.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Removed Modules ({diff.modules.removed.length})
              </h4>
              <div className="space-y-2">
                {diff.modules.removed.map((module, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <Minus className="h-3 w-3 text-red-500" />
                    <span className="text-sm font-mono">{module}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diff.modules.modified.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Modified Modules ({diff.modules.modified.length})
              </h4>
              <div className="space-y-2">
                {diff.modules.modified.map((module, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-mono">{module}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-medium mb-2">Function Changes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-500">Added:</span>
                  <span className="font-medium">{diff.functions.added}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500">Removed:</span>
                  <span className="font-medium">{diff.functions.removed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500">Modified:</span>
                  <span className="font-medium">{diff.functions.modified}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Security Changes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-500">New Issues:</span>
                  <span className="font-medium">{diff.vulnerabilities.added}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-500">Fixed:</span>
                  <span className="font-medium">{diff.vulnerabilities.fixed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};