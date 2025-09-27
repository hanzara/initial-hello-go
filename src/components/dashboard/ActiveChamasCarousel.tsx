import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useNavigate } from 'react-router-dom';

interface Chama {
  id: string;
  name: string;
  total_savings: number;
  current_members: number;
  max_members: number;
  next_meeting?: string;
  user_role: string;
  contribution_amount: number;
  status: string;
}

interface ActiveChamasCarouselProps {
  chamas: Chama[];
  onViewChama: (chamaId: string) => void;
}

export const ActiveChamasCarousel: React.FC<ActiveChamasCarouselProps> = ({ 
  chamas, 
  onViewChama 
}) => {
  const navigate = useNavigate();

  if (!chamas || chamas.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Active Chamas
          </CardTitle>
          <CardDescription>Your group savings circles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Active Chamas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join or create a chama to start saving with others
            </p>
            <Button onClick={() => navigate('/available-chamas')}>
              Explore Chamas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Active Chamas ({chamas.length})
        </CardTitle>
        <CardDescription>Your group savings circles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chamas.map((chama) => (
            <div
              key={chama.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewChama(chama.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{chama.name}</h4>
                  <Badge variant="secondary" className="mt-1">
                    {chama.user_role}
                  </Badge>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <CurrencyDisplay 
                    amount={chama.total_savings} 
                    className="font-semibold text-success" 
                    showToggle={false} 
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-semibold">
                    {chama.current_members}/{chama.max_members}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contribution</p>
                  <CurrencyDisplay 
                    amount={chama.contribution_amount} 
                    className="font-semibold" 
                    showToggle={false} 
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={chama.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {chama.status}
                  </Badge>
                </div>
              </div>

              {chama.next_meeting && (
                <div className="mt-3 p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Next meeting: {new Date(chama.next_meeting).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};