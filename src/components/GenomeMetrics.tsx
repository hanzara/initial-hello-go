import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Shield, Zap, Code, FileCode, GitBranch, 
  AlertTriangle, CheckCircle, Package, TestTube 
} from "lucide-react";

interface Metric {
  label: string;
  value: number | string;
  max?: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface GenomeMetricsProps {
  efficiencyScore: number;
  healthData?: {
    security_risk: string;
    test_coverage: number;
    technical_debt_score: number;
    performance_score: number;
    maintainability_score: number;
  };
  moduleCount?: number;
  functionCount?: number;
  dependencyCount?: number;
  packageCount?: number;
}

export function GenomeMetrics({ 
  efficiencyScore, 
  healthData, 
  moduleCount = 0, 
  functionCount = 0,
  dependencyCount = 0,
  packageCount = 0
}: GenomeMetricsProps) {
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-destructive';
  };

  const metrics: Metric[] = [
    {
      label: 'Efficiency Score',
      value: efficiencyScore,
      max: 100,
      icon: <Activity className="h-4 w-4" />,
      color: getScoreColor(efficiencyScore),
      description: 'Overall code quality and optimization'
    },
    {
      label: 'Security Risk',
      value: healthData?.security_risk || 'unknown',
      icon: <Shield className="h-4 w-4" />,
      color: getRiskColor(healthData?.security_risk || ''),
      description: 'Vulnerability and security posture'
    },
    {
      label: 'Test Coverage',
      value: healthData?.test_coverage || 0,
      max: 100,
      icon: <TestTube className="h-4 w-4" />,
      color: getScoreColor(healthData?.test_coverage || 0),
      description: 'Percentage of code covered by tests'
    },
    {
      label: 'Performance',
      value: healthData?.performance_score || 0,
      max: 100,
      icon: <Zap className="h-4 w-4" />,
      color: getScoreColor(healthData?.performance_score || 0),
      description: 'Runtime efficiency and optimization'
    },
    {
      label: 'Maintainability',
      value: healthData?.maintainability_score || 0,
      max: 100,
      icon: <CheckCircle className="h-4 w-4" />,
      color: getScoreColor(healthData?.maintainability_score || 0),
      description: 'Code readability and structure'
    },
    {
      label: 'Technical Debt',
      value: healthData?.technical_debt_score || 0,
      max: 100,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: getScoreColor(100 - (healthData?.technical_debt_score || 0)),
      description: 'Accumulated shortcuts and todos'
    }
  ];

  const structureMetrics = [
    {
      label: 'Modules',
      value: moduleCount,
      icon: <FileCode className="h-4 w-4 text-blue-500" />
    },
    {
      label: 'Functions',
      value: functionCount,
      icon: <Code className="h-4 w-4 text-purple-500" />
    },
    {
      label: 'Dependencies',
      value: dependencyCount,
      icon: <GitBranch className="h-4 w-4 text-green-500" />
    },
    {
      label: 'Packages',
      value: packageCount,
      icon: <Package className="h-4 w-4 text-orange-500" />
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Efficiency Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Digital Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`text-6xl font-bold ${getScoreColor(efficiencyScore)}`}>
              {efficiencyScore}
            </div>
            <div className="flex-1">
              <Progress value={efficiencyScore} className="h-4 mb-2" />
              <p className="text-sm text-muted-foreground">
                {efficiencyScore >= 80 ? 'Excellent - Production ready' : 
                 efficiencyScore >= 60 ? 'Good - Minor improvements recommended' : 
                 efficiencyScore >= 40 ? 'Fair - Needs improvement' : 
                 'Critical - Requires immediate attention'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className={metric.color}>{metric.icon}</span>
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-2 ${metric.color}`}>
                {typeof metric.value === 'number' && metric.max ? 
                  `${metric.value}%` : 
                  metric.value.toString().toUpperCase()
                }
              </div>
              {typeof metric.value === 'number' && metric.max && (
                <Progress value={metric.value} className="h-2 mb-2" />
              )}
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Structure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Codebase Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {structureMetrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
