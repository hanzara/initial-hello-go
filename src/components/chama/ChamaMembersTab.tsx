import React, { useState } from 'react';
import { Users, User, Search, Filter, Shield, Star, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChamaMembers } from '@/hooks/useChamaMembers';

interface ChamaMembersTabProps {
  chamaId: string;
  userRole?: string;
  isAdmin?: boolean;
}

export const ChamaMembersTab: React.FC<ChamaMembersTabProps> = ({ 
  chamaId, 
  userRole = 'member',
  isAdmin = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  const { data: members, isLoading } = useChamaMembers(chamaId);

  const filteredMembers = members?.filter(member => {
    const matchesSearch = !searchQuery;
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "default",
      treasurer: "secondary", 
      secretary: "outline",
      member: "outline"
    };

    const colors: Record<string, string> = {
      admin: "text-blue-600 bg-blue-50 border-blue-200",
      treasurer: "text-green-600 bg-green-50 border-green-200",
      secretary: "text-purple-600 bg-purple-50 border-purple-200",
      member: "text-gray-600 bg-gray-50 border-gray-200"
    };

    return (
      <Badge variant={variants[role] || "outline"} className={colors[role]}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Members</h3>
          <p className="text-sm text-muted-foreground">
            {members?.length || 0} total members
          </p>
        </div>
        {isAdmin && (
          <Button>
            Invite Members
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="treasurer">Treasurer</SelectItem>
            <SelectItem value="secretary">Secretary</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => m.role === 'admin').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Treasurers</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => m.role === 'treasurer').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => m.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-lg font-semibold">
                  {members?.filter(m => 
                    m.last_contribution_date && 
                    new Date(m.last_contribution_date).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials('Member')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">Member</h4>
                      {getRoleBadge(member.role)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                      </div>
                      {member.total_contributed > 0 && (
                        <div className="flex items-center gap-1">
                          <span>Contributed: {formatCurrency(member.total_contributed)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.last_contribution_date && (
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Last contribution</p>
                      <p>{new Date(member.last_contribution_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {isAdmin && (
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No members found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No members match your search criteria.' : 'This chama has no members yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};