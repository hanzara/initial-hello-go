import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";

interface CampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositories: any[];
  selectedRepo: string | null;
  onCreateCampaign: (data: CampaignData) => void;
}

export interface CampaignData {
  name: string;
  repositoryId: string;
  targetModule?: string;
  goalWeights: {
    speed: number;
    cost: number;
    memory: number;
    security: number;
    maintainability: number;
  };
  scope: string;
  mode: string;
  testSuite?: string;
  maxVariants: number;
  computeBudget: number;
}

export function CampaignModal({ 
  open, 
  onOpenChange, 
  repositories, 
  selectedRepo,
  onCreateCampaign 
}: CampaignModalProps) {
  const [campaignName, setCampaignName] = useState("");
  const [targetModule, setTargetModule] = useState("");
  const [repoId, setRepoId] = useState(selectedRepo || "");
  const [scope, setScope] = useState("function");
  const [mode, setMode] = useState("guided");
  const [testSuite, setTestSuite] = useState("");
  const [maxVariants, setMaxVariants] = useState(20);
  const [computeBudget, setComputeBudget] = useState(100);
  
  // Goal weights (sum should be 100)
  const [speedWeight, setSpeedWeight] = useState(40);
  const [costWeight, setCostWeight] = useState(20);
  const [memoryWeight, setMemoryWeight] = useState(15);
  const [securityWeight, setSecurityWeight] = useState(15);
  const [maintainabilityWeight, setMaintainabilityWeight] = useState(10);

  const handleCreate = () => {
    onCreateCampaign({
      name: campaignName,
      repositoryId: repoId,
      targetModule: targetModule || undefined,
      goalWeights: {
        speed: speedWeight,
        cost: costWeight,
        memory: memoryWeight,
        security: securityWeight,
        maintainability: maintainabilityWeight,
      },
      scope,
      mode,
      testSuite: testSuite || undefined,
      maxVariants,
      computeBudget,
    });
    
    // Reset form
    setCampaignName("");
    setTargetModule("");
    setTestSuite("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Start Mutation Campaign
          </DialogTitle>
          <DialogDescription>
            Configure your AI-powered code evolution campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Q4 Performance Optimization"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          {/* Repository Selection */}
          <div className="space-y-2">
            <Label htmlFor="repository">Target Repository *</Label>
            <Select value={repoId} onValueChange={setRepoId}>
              <SelectTrigger>
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Module */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Module (Optional)</Label>
            <Input
              id="target"
              placeholder="e.g., src/api/orders.js or leave empty for entire repo"
              value={targetModule}
              onChange={(e) => setTargetModule(e.target.value)}
            />
          </div>

          {/* Goal Weights */}
          <div className="space-y-4">
            <Label>Goal Weights (Total: {speedWeight + costWeight + memoryWeight + securityWeight + maintainabilityWeight}%)</Label>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Speed</span>
                  <span className="text-sm font-medium">{speedWeight}%</span>
                </div>
                <Slider value={[speedWeight]} onValueChange={([v]) => setSpeedWeight(v)} max={100} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cost</span>
                  <span className="text-sm font-medium">{costWeight}%</span>
                </div>
                <Slider value={[costWeight]} onValueChange={([v]) => setCostWeight(v)} max={100} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Memory</span>
                  <span className="text-sm font-medium">{memoryWeight}%</span>
                </div>
                <Slider value={[memoryWeight]} onValueChange={([v]) => setMemoryWeight(v)} max={100} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Security</span>
                  <span className="text-sm font-medium">{securityWeight}%</span>
                </div>
                <Slider value={[securityWeight]} onValueChange={([v]) => setSecurityWeight(v)} max={100} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Maintainability</span>
                  <span className="text-sm font-medium">{maintainabilityWeight}%</span>
                </div>
                <Slider value={[maintainabilityWeight]} onValueChange={([v]) => setMaintainabilityWeight(v)} max={100} step={5} />
              </div>
            </div>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label>Mutation Scope</Label>
            <RadioGroup value={scope} onValueChange={setScope}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="function" id="function" />
                <Label htmlFor="function" className="font-normal cursor-pointer">
                  Function-level (safest, fastest)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="module" id="module" />
                <Label htmlFor="module" className="font-normal cursor-pointer">
                  Module-level (more comprehensive)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="config" id="config" />
                <Label htmlFor="config" className="font-normal cursor-pointer">
                  Config-only (safe, non-code changes)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label>Campaign Mode</Label>
            <RadioGroup value={mode} onValueChange={setMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guided" id="guided" />
                <Label htmlFor="guided" className="font-normal cursor-pointer">
                  Guided (human approval required)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="font-normal cursor-pointer">
                  Auto (auto-apply low-risk mutations)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Test Suite */}
          <div className="space-y-2">
            <Label htmlFor="tests">Test Suite Command (Optional)</Label>
            <Textarea
              id="tests"
              placeholder="e.g., npm test or python -m pytest"
              value={testSuite}
              onChange={(e) => setTestSuite(e.target.value)}
              rows={2}
            />
          </div>

          {/* Max Variants */}
          <div className="space-y-2">
            <Label htmlFor="variants">Max Variants: {maxVariants}</Label>
            <Slider 
              value={[maxVariants]} 
              onValueChange={([v]) => setMaxVariants(v)} 
              min={5} 
              max={50} 
              step={5} 
            />
          </div>

          {/* Compute Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Compute Budget (Credits): {computeBudget}</Label>
            <Slider 
              value={[computeBudget]} 
              onValueChange={([v]) => setComputeBudget(v)} 
              min={50} 
              max={1000} 
              step={50} 
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!campaignName || !repoId}>
            Start Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
