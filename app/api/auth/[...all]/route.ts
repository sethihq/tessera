import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Auth endpoint not needed with Supabase" }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ message: "Auth endpoint not needed with Supabase" }, { status: 404 })
}
