import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

type OrderPayload = {
  client_ai?: string
  name: string
  phone: string
  town?: string
  city?: string
  products: string
  total: number
  payment_method?: string
  observations?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderPayload

    const requiredFields: (keyof OrderPayload)[] = ['name', 'phone', 'products', 'total']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return new NextResponse(
        `Faltan los siguientes campos obligatorios: ${missingFields.join(', ')}`,
        { status: 400 }
      )
    }

    const {
      client_ai,
      name,
      phone,
      town,
      city,
      products,
      total,
      payment_method,
      observations
    } = body

    const { data, error } = await supabase
      .from('customers_orders')
      .insert([
        {
          client_ai,
          name,
          phone,
          town,
          city,
          products,
          total,
          payment_method,
          observations
        }
      ])
      .select()
      .single()

    if (error) {
      return new NextResponse(
        `Error al guardar el pedido en la base de datos: ${error.message}`,
        { status: 500 }
      )
    }

    return new NextResponse(
      `Pedido creado exitosamente. ID del pedido: ${data.id}`,
      { status: 200 }
    )
  } catch (e) {
    console.error('Server error:', e)
    return new NextResponse(
      `Error interno del servidor: ${e instanceof Error ? e.message : 'Error desconocido'}`,
      { status: 500 }
    )
  }
}
