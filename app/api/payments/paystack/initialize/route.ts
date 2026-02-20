import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const initializePaymentSchema = z.object({
    email: z.string().email(),
    amount: z.number().positive(),
    currency: z.string().optional().default('GHS'),
    userId: z.string().uuid(),
    type: z.string().default('import_order'),
    relatedId: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = initializePaymentSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.format() },
                { status: 400 }
            )
        }

        const { email, amount, currency, userId, type, relatedId } = result.data

        // 1. Create a payment record in Supabase
        const { data: payment, error: dbError } = await supabaseAdmin
            .from('payments')
            .insert({
                user_id: userId,
                amount,
                currency,
                provider: 'paystack',
                status: 'pending',
                type,
                related_id: relatedId || null,
            })
            .select()
            .single()

        if (dbError) {
            console.error('DB Error:', dbError)
            return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
        }

        // 2. Initialize Paystack transaction
        const paystackRes = await fetch(
            'https://api.paystack.co/transaction/initialize',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    amount: Math.round(amount * 100), // Paystack expects amount in pesewas/kobo
                    currency,
                    reference: payment.id, // Use our payment ID as the reference
                    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/payment-success`,
                    metadata: {
                        payment_id: payment.id,
                        type,
                        related_id: relatedId,
                    },
                }),
            }
        )

        if (!paystackRes.ok) {
            const errorData = await paystackRes.json().catch(() => ({}));
            console.error('Paystack API Error:', errorData);
            return NextResponse.json(
                { error: 'Paystack initialization failed', details: errorData },
                { status: paystackRes.status }
            );
        }

        const paystackData = await paystackRes.json()

        if (!paystackData.status) {
            return NextResponse.json(
                { error: paystackData.message || 'Paystack initialization failed' },
                { status: 400 }
            )
        }

        // 3. Save the Paystack reference back to our payment record
        await supabaseAdmin
            .from('payments')
            .update({ provider_reference: paystackData.data.reference })
            .eq('id', payment.id)

        return NextResponse.json({
            success: true,
            authorization_url: paystackData.data.authorization_url,
            reference: paystackData.data.reference,
            payment_id: payment.id,
        })
    } catch (error: any) {
        console.error('Payment init error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
