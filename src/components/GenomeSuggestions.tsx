import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Suggestion {
  id: string;
  suggestion_type: string;
  title: string;
  description: string;
  confidence: number;
  priority: string;
  status: string;
  template_patch?: string;
}

interface GenomeSuggestionsProps {
  suggestions: Suggestion[];
  onStatusChange?: () => void;
}

export function GenomeSuggestions({ suggestions, onStatusChange }: GenomeSuggestionsProps) {
  const handleStatusUpdate = async (suggestionId: string, newStatus: string) => {
    const { error } = await supabase
      .from('genome_suggestions')
      .update({ status: newStatus })
      .eq('id', suggestionId);

    if (error) {
      toast.error('Failed to update suggestion status');
      return;
    }

    toast.success(`Suggestion marked as ${newStatus}`);
    onStatusChange?.();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    return <Lightbulb className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI-Generated Suggestions
        </CardTitle>
        <CardDescription>
          Machine learning recommendations based on industry best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No suggestions available yet</p>
            <p className="text-sm">Run a genome scan to get AI-powered recommendations</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 rounded-lg border-2 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getTypeIcon(suggestion.suggestion_type)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.suggestion_type}
                      </Badge>
                      <Badge variant="secondary">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                      {suggestion.status !== 'open' && (
                        <Badge variant="outline">
                          {suggestion.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {suggestion.template_patch && (
                <div className="bg-secondary/20 rounded p-3 mb-3 font-mono text-xs overflow-x-auto">
                  {suggestion.template_patch}
                </div>
              )}

              {suggestion.status === 'open' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStatusUpdate(suggestion.id, 'accepted')}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(suggestion.id, 'implemented')}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Mark Implemented
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusUpdate(suggestion.id, 'rejected')}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
