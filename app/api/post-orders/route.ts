import { NextRequest, NextResponse } from 'next/server';
import {supabase} from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        const {
            client_ai, name, phone, town, city, products, total, payment_method, observations
        } = body;

        // Validación básica
        const requiredFields = ['name', 'phone', 'products', 'total'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: `Missing required fields: ${missingFields.join(', ')}` 
                },
                { status: 400 }
            );
        }

        // Insertar en Supabase
        const { data, error } = await supabase.from('customers_orders')
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
            .single();
        
        if (error) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Database error',
                    error: error.message 
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Order created successfully',
            orderId: data.id // Asumiendo que hay un campo id
        });

    } catch (e) {
        console.error('Server error:', e);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Internal server error',
                error: e instanceof Error ? e.message : 'Unknown error'
            },
            { status: 500 }
        );
    }

}