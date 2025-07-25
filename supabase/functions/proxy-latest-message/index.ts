import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Proxying request to lovable-api.com...');
    
    const apiRes = await fetch(
      "https://lovable-api.com/projects/712f3262-fb25-47c1-8d7d-bc40eac7337c/latest-message",
      { 
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function-Proxy'
        } 
      }
    );

    const body = await apiRes.text();
    
    console.log(`API response status: ${apiRes.status}`);
    
    return new Response(body, {
      status: apiRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": apiRes.headers.get("content-type") ?? "application/json",
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});