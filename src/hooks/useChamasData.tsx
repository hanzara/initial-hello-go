import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Hook for fetching user's chamas
export const useUserChamas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-chamas', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          chama_id,
          role,
          joined_at,
          is_active,
          total_contributed,
          last_contribution_date,
          chamas(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      // Return chamas with member info
      return data.map(member => ({
        ...member.chamas,
        userRole: member.role,
        userJoinedAt: member.joined_at,
        userTotalContributed: member.total_contributed,
        userLastContribution: member.last_contribution_date
      }));
    },
    enabled: !!user
  });
};

// Hook for creating a new chama
export const useCreateChamaWithMembership = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chamaData: {
      name: string;
      description?: string;
      contribution_amount: number;
      contribution_frequency: string;
      max_members: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Create chama
      const { data: chama, error: chamaError } = await supabase
        .from('chamas')
        .insert({
          ...chamaData,
          created_by: user.id
        })
        .select()
        .single();

      if (chamaError) throw chamaError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chama.id,
          user_id: user.id,
          role: 'admin',
          is_active: true
        });

      if (memberError) throw memberError;

      return chama;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      toast({
        title: "Chama Created! 🎉",
        description: "Your chama has been created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chama",
        variant: "destructive"
      });
    }
  });
};

// Hook for joining a chama
export const useJoinChamaWithMembership = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chamaId, role = 'member' }: { chamaId: string; role?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chamaId,
          user_id: user.id,
          role,
          is_active: true
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] });
      toast({
        title: "Joined Chama! 👥",
        description: "You have successfully joined the chama"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to join chama",
        variant: "destructive"
      });
    }
  });
};

// Hook for fetching available chamas to join
export const useAvailableChamasToJoin = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-chamas', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get chamas user is not a member of
      const { data: userChamas } = await supabase
        .from('chama_members')
        .select('chama_id')
        .eq('user_id', user.id);

      const userChamaIds = userChamas?.map(m => m.chama_id) || [];

      let query = supabase
        .from('chamas')
        .select('*')
        .eq('status', 'active');

      if (userChamaIds.length > 0) {
        query = query.not('id', 'in', `(${userChamaIds.join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};