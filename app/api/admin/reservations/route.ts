// Este archivo es redundante si usamos Server Actions en app/admin/page.tsx, 
// pero lo incluyo por si quieres hacer llamadas API externas.
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: Request) {
    // Lógica simple para API pura si se necesita
    return NextResponse.json({ message: "Use Server Actions en Admin Page" });
}
