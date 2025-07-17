import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

type CustomerPayload = {
  phone_id : string
  fullname : string
  address : string
  phone : string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CustomerPayload

    const requiredFields: (keyof CustomerPayload)[] = ['fullname', 'address', 'phone']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    const {
      phone_id,
      fullname,
      address,
      phone
    } = body

    // Verificar si ya existe el registro con ese phone_id
    const { data: existing, error: selectError } = await supabase
      .from('customers_101')
      .select('id, phone_id, fullname, address, phone') // Selecciona todos los campos necesarios
      .eq('phone_id', phone_id)
      .single()

    if (existing) {

        // Actualizar el registro existente
        const { data: updated, error: updateError } = await supabase
          .from('customers_101')
          .update({ fullname, address, phone })
          .eq('phone_id', phone_id)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            {
              success: false,
              message: 'Error al actualizar',
              error: updateError.message
            },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Datos actualizados correctamente',
          data: updated
        })

    }

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: No rows found
      return NextResponse.json(
        {
          success: false,
          message: 'Error al comprobar existencia',
          error: selectError.message
        },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from('customers_101')
      .insert([
        {
          phone_id,
          fullname,
          address,
          phone
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database error',
          error: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      orderId: data.id
    })
  } catch (e) {
    console.error('Server error:', e)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: e instanceof Error ? e.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}