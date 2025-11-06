import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";

interface Module {
  id: string;
  path: string;
  language: string;
  loc: number;
  x?: number;
  y?: number;
}

interface Dependency {
  from_module_id: string;
  to_module_id: string;
}

interface GenomeVisualizationProps {
  modules: Module[];
  dependencies: Dependency[];
  onModuleClick?: (module: Module) => void;
}

export function GenomeVisualization({ modules, dependencies, onModuleClick }: GenomeVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || modules.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Position modules in a force-directed layout (simplified circular layout)
    const centerX = canvas.width / (2 * zoom);
    const centerY = canvas.height / (2 * zoom);
    const radius = Math.min(centerX, centerY) * 0.7;

    const modulesWithPos = modules.map((module, index) => {
      const angle = (index / modules.length) * 2 * Math.PI;
      return {
        ...module,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Draw dependencies (edges)
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
    ctx.lineWidth = 1;
    dependencies.forEach(dep => {
      const from = modulesWithPos.find(m => m.id === dep.from_module_id);
      const to = modulesWithPos.find(m => m.id === dep.to_module_id);
      
      if (from && to && from.x && from.y && to.x && to.y) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    // Draw modules (nodes)
    modulesWithPos.forEach(module => {
      if (!module.x || !module.y) return;

      const nodeRadius = Math.max(5, Math.min(20, module.loc / 20));
      const isSelected = selectedModule?.id === module.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(module.x, module.y, nodeRadius, 0, 2 * Math.PI);
      
      // Color by language
      const languageColors: Record<string, string> = {
        javascript: '#f7df1e',
        typescript: '#3178c6',
        python: '#3776ab',
        java: '#007396',
        go: '#00add8',
        rust: '#ce422b',
        css: '#1572b6',
        html: '#e34f26'
      };
      
      ctx.fillStyle = languageColors[module.language] || '#888888';
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label for larger nodes
      if (nodeRadius > 10 && zoom > 0.5) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        const fileName = module.path.split('/').pop() || '';
        ctx.fillText(fileName.substring(0, 15), module.x, module.y + nodeRadius + 12);
      }
    });

    ctx.restore();

    // Store positions for click detection
    (window as any).genomeModules = modulesWithPos;
  }, [modules, dependencies, zoom, pan, selectedModule]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const modulesWithPos = (window as any).genomeModules || [];
    const clicked = modulesWithPos.find((m: any) => {
      if (!m.x || !m.y) return false;
      const nodeRadius = Math.max(5, Math.min(20, m.loc / 20));
      const dist = Math.sqrt((m.x - x) ** 2 + (m.y - y) ** 2);
      return dist <= nodeRadius;
    });

    if (clicked) {
      setSelectedModule(clicked);
      onModuleClick?.(clicked);
    } else {
      setSelectedModule(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'genome-map.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Digital Genome Map
            </CardTitle>
            <CardDescription>
              Interactive visualization of your codebase structure • {modules.length} modules • {dependencies.length} connections
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.1, z - 0.2))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetView}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadImage}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-[500px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg cursor-move"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {selectedModule && (
            <div className="absolute top-4 right-4 bg-background/95 backdrop-blur p-4 rounded-lg border-2 max-w-xs">
              <h4 className="font-semibold mb-2">{selectedModule.path}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <Badge variant="secondary">{selectedModule.language}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lines of Code:</span>
                  <span className="font-medium">{selectedModule.loc}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant="secondary">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
              JavaScript
            </Badge>
            <Badge variant="secondary">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              TypeScript
            </Badge>
            <Badge variant="secondary">
              <div className="w-2 h-2 rounded-full bg-blue-700 mr-2"></div>
              Python
            </Badge>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Click nodes to inspect • Drag to pan • Scroll to zoom
        </p>
      </CardContent>
    </Card>
  );
}
