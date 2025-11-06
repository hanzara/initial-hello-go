import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Package } from "lucide-react";
import { toast } from "sonner";

interface GenomeData {
  genome_id: string;
  repository_name: string;
  branch: string;
  fingerprint: string;
  efficiency_score: number;
  scan_date: string;
  modules: any[];
  functions: any[];
  dependencies: any[];
  packages: any[];
  health: any;
  suggestions: any[];
}

interface GenomeExportProps {
  genomeData: GenomeData;
}

export const GenomeExport = ({ genomeData }: GenomeExportProps) => {
  const exportToTDGMAP = () => {
    try {
      const tdgmapData = {
        version: "1.0.0",
        format: "TDGMAP",
        metadata: {
          repository: genomeData.repository_name,
          branch: genomeData.branch,
          scan_date: genomeData.scan_date,
          fingerprint: genomeData.fingerprint,
        },
        genome: {
          id: genomeData.genome_id,
          efficiency_score: genomeData.efficiency_score,
          modules: genomeData.modules.map(m => ({
            path: m.path,
            language: m.language,
            loc: m.loc,
            fingerprint: m.fingerprint,
          })),
          functions: genomeData.functions.map(f => ({
            name: f.name,
            complexity: f.cyclomatic_complexity,
            lines: `${f.start_line}-${f.end_line}`,
          })),
          dependencies: genomeData.dependencies.length,
          packages: genomeData.packages.map(p => ({
            name: p.name,
            version: p.version,
            vulnerabilities: p.vulnerability_count,
          })),
        },
        health: genomeData.health,
        suggestions: genomeData.suggestions.map(s => ({
          type: s.suggestion_type,
          title: s.title,
          priority: s.priority,
          confidence: s.confidence,
        })),
      };

      const blob = new Blob([JSON.stringify(tdgmapData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${genomeData.repository_name}_${genomeData.branch}_${Date.now()}.tdgmap`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Genome exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export genome");
    }
  };

  const exportToJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(genomeData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `genome_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data exported as JSON");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export JSON");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Export Genome</h3>
      </div>

      <div className="space-y-3">
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium mb-1">TDGMAP Format</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Structured genome map optimized for analysis and comparison
              </p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <Button onClick={exportToTDGMAP} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export as .tdgmap
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium mb-1">JSON Format</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Complete raw data export with all metadata
              </p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <Button onClick={exportToJSON} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
        </div>
      </div>
    </Card>
  );
};