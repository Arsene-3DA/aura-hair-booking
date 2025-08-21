import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      users: any
      profiles: any
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with service role key for admin access
    const supabaseAdmin = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get authorization header to verify admin role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a client with user token to verify their role
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      console.error('User verification failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user is admin using service role client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      console.error('Admin check failed:', profileError)
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get all users using service role (bypasses RLS)
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        auth_id,
        email,
        nom,
        prenom,
        role,
        status,
        created_at,
        updated_at,
        telephone,
        is_test
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get profiles data
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, avatar_url')

    if (profilesError) {
      console.warn('Warning fetching profiles:', profilesError)
    }

    // Filter out test accounts and merge with profile data
    const filteredUsers = usersData
      ?.filter(user => {
        // Exclude test accounts marked as such
        if (user.is_test) return false
        
        // Exclude obvious demo accounts
        const isDemoAccount = 
          user.email?.toLowerCase().includes('demo') ||
          user.email?.toLowerCase().includes('example.com') ||
          user.nom?.toLowerCase().includes('système') ||
          (user.nom?.toLowerCase() === 'test' && user.prenom?.toLowerCase() === 'test')
        
        return !isDemoAccount && user.email && user.email.trim() !== ''
      })
      ?.map(user => {
        const profile = profilesData?.find(p => p.user_id === user.auth_id)
        return {
          ...user,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url
        }
      }) || []

    console.log(`Returning ${filteredUsers.length} users for admin dashboard`)

    return new Response(
      JSON.stringify({ 
        users: filteredUsers,
        total: filteredUsers.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})