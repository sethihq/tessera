import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const supabase = await createClient()

    // Get the current user (templates can be viewed by authenticated users)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Build query for templates
    let query = supabase
      .from('sprite_sheet_templates')
      .select('*')
      .order('name')

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: templates, error } = await query

    if (error) {
      throw error
    }

    // Group templates by category for easier frontend handling
    const templatesByCategory = (templates || []).reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    }, {} as Record<string, typeof templates>)

    return NextResponse.json({
      templates: templates || [],
      templates_by_category: templatesByCategory,
      categories: Object.keys(templatesByCategory)
    })

  } catch (error) {
    console.error("[API] Get sprite sheet templates error:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch sprite sheet templates" },
      { status: 500 }
    )
  }
}
