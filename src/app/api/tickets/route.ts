import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .order('updated_at', { ascending: false })

  if (ticketsError) {
    return NextResponse.json({ error: ticketsError.message }, { status: 500 })
  }

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (commentsError) {
    return NextResponse.json({ error: commentsError.message }, { status: 500 })
  }

  return NextResponse.json({ tickets, comments })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  if (body.type === 'ticket') {
    const { data, error } = await supabase
      .from('tickets')
      .insert([body.data])
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data[0])
  }
  
  if (body.type === 'comment') {
    const { data, error } = await supabase
      .from('comments')
      .insert([body.data])
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    // Update ticket updated_at
    await supabase
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', body.data.ticket_id)
    
    return NextResponse.json(data[0])
  }
  
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
