import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🧹 Starting cleanup of orphaned stylist avatars...')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get all files in the stylists bucket
    const { data: files, error: listError } = await supabase.storage
      .from('stylists')
      .list()

    if (listError) {
      console.error('❌ Error listing files:', listError)
      throw listError
    }

    console.log(`📁 Found ${files?.length || 0} files in stylists bucket`)

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No files to cleanup',
          deletedFiles: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Get all active hairdresser IDs
    const { data: hairdressers, error: dbError } = await supabase
      .from('hairdressers')
      .select('id')

    if (dbError) {
      console.error('❌ Error fetching hairdressers:', dbError)
      throw dbError
    }

    const activeHairdresserIds = new Set(hairdressers?.map(h => h.id) || [])
    console.log(`👨‍💼 Found ${activeHairdresserIds.size} active hairdressers`)

    // 3. Identify orphaned files
    const orphanedFiles: string[] = []
    
    for (const file of files) {
      if (file.name && file.name !== '.emptyFolderPlaceholder') {
        // Extract hairdresser ID from file path (format: {hairdresser_id}/slug.jpg)
        const pathParts = file.name.split('/')
        if (pathParts.length >= 1) {
          const hairdresserId = pathParts[0]
          
          // Check if this hairdresser still exists
          if (!activeHairdresserIds.has(hairdresserId)) {
            orphanedFiles.push(file.name)
            console.log(`🗑️ Orphaned file found: ${file.name} (hairdresser ${hairdresserId} not found)`)
          }
        }
      }
    }

    console.log(`🔍 Found ${orphanedFiles.length} orphaned files`)

    // 4. Delete orphaned files
    let deletedCount = 0
    const deleteErrors: string[] = []

    if (orphanedFiles.length > 0) {
      // Delete files in batches to avoid rate limits
      const batchSize = 10
      for (let i = 0; i < orphanedFiles.length; i += batchSize) {
        const batch = orphanedFiles.slice(i, i + batchSize)
        
        const { error: deleteError } = await supabase.storage
          .from('stylists')
          .remove(batch)

        if (deleteError) {
          console.error(`❌ Error deleting batch ${Math.floor(i/batchSize) + 1}:`, deleteError)
          deleteErrors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${deleteError.message}`)
        } else {
          deletedCount += batch.length
          console.log(`✅ Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} files`)
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // 5. Log cleanup summary
    console.log(`🎉 Cleanup completed:`)
    console.log(`   - Files scanned: ${files.length}`)
    console.log(`   - Active hairdressers: ${activeHairdresserIds.size}`)
    console.log(`   - Orphaned files found: ${orphanedFiles.length}`)
    console.log(`   - Files deleted: ${deletedCount}`)
    console.log(`   - Errors: ${deleteErrors.length}`)

    const response = {
      success: true,
      message: 'Avatar cleanup completed',
      stats: {
        filesScanned: files.length,
        activeHairdressers: activeHairdresserIds.size,
        orphanedFilesFound: orphanedFiles.length,
        filesDeleted: deletedCount,
        errors: deleteErrors
      }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('💥 Cleanup function failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Cleanup failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})