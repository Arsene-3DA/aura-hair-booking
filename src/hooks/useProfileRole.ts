import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "client" | "coiffeur" | "admin";

export function useProfileRole(uid?: string) {
  return useQuery({
    queryKey: ["profileRole", uid],
    queryFn: async () => {
      if (!uid) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", uid)
        .single();
      if (error) throw error;
      return data.role as UserRole;
    },
    enabled: !!uid,
  });
}