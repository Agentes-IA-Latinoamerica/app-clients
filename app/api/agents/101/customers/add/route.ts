import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { parse } from 'querystring'

type CustomerPayload = {
  phone_id: string
  fullname: string
  address: string
  phone: string
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let body: CustomerPayload | undefined

    if (contentType.includes('application/json')) {
      body = (await req.json()) as CustomerPayload
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const raw = await req.text()
      body = parse(raw) as unknown as CustomerPayload
    } else {
      return new NextResponse(
        'Tipo de contenido no soportado',
        { status: 415, headers: { 'Content-Type': 'text/plain' } }
      )
    }

    const requiredFields: (keyof CustomerPayload)[] = ['fullname', 'address', 'phone']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return new NextResponse(
        `Faltan los siguientes campos obligatorios: ${missingFields.join(', ')}`,
        { status: 400, headers: { 'Content-Type': 'text/plain' } }
      )
    }

    const { phone_id, fullname, address, phone } = body

    // Buscar si ya existe
    const { data: existing, error: selectError } = await supabase
      .from('customers_101')
      .select('id')
      .eq('phone_id', phone_id)
      .single()

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('customers_101')
        .update({ fullname, address, phone })
        .eq('phone_id', phone_id)
        .select()
        .single()

      if (updateError) {
        return new NextResponse(
          `Error al actualizar datos: ${updateError.message}`,
          { status: 500, headers: { 'Content-Type': 'text/plain' } }
        )
      }

      return new NextResponse(
        `Datos actualizados correctamente. ID: ${updated.id}`,
        { status: 200, headers: { 'Content-Type': 'text/plain' } }
      )
    }

    if (selectError && selectError.code !== 'PGRST116') {
      return new NextResponse(
        `Error al verificar existencia: ${selectError.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      )
    }

    const { data, error } = await supabase
      .from('customers_101')
      .insert([{ phone_id, fullname, address, phone }])
      .select()
      .single()

    if (error) {
      return new NextResponse(
        `Error al crear el cliente: ${error.message}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      )
    }

    return new NextResponse(
      `Cliente creado correctamente. ID: ${data.id}`,
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    )

  } catch (e) {
    console.error('Server error:', e)
    return new NextResponse(
      `Error interno del servidor: ${e instanceof Error ? e.message : 'Error desconocido'}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    )
  }
}
