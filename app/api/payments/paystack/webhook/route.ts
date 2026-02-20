import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-paystack-signature')

        // Verify webhook signature
        if (process.env.PAYSTACK_SECRET_KEY) {
            const hash = crypto
                .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                .update(body)
                .digest('hex')

            if (hash !== signature) {
                return new Response('Invalid signature', { status: 401 })
            }
        }

        const event = JSON.parse(body)

        if (event.event === 'charge.success') {
            const reference = event.data.reference
            const amount = event.data.amount / 100 // Convert back from pesewas/kobo

            // 1. Update payment status to completed
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .update({
                    status: 'completed',
                    provider_reference: reference,
                    metadata: event.data,
                })
                .eq('provider_reference', reference)
                .select()
                .single()

            if (!payment) {
                // Try matching by ID (we use payment.id as reference)
                const { data: paymentById } = await supabaseAdmin
                    .from('payments')
                    .update({
                        status: 'completed',
                        provider_reference: reference,
                        metadata: event.data,
                    })
                    .eq('id', reference)
                    .select()
                    .single()

                if (paymentById) {
                    await handlePaymentSuccess(paymentById)
                }
            } else {
                await handlePaymentSuccess(payment)
            }
        }

        return new Response('OK', { status: 200 })
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response('Webhook error', { status: 500 })
    }
}

async function handlePaymentSuccess(payment: any) {
    // Handle different payment types
    if (payment.type === 'import_order' && payment.related_id) {
        // Activate the import order
        await supabaseAdmin
            .from('import_orders')
            .update({
                status: 'processing',
                payment_id: payment.id,
            })
            .eq('id', payment.related_id)

        // Update the import request status
        const { data: order } = await supabaseAdmin
            .from('import_orders')
            .select('quote_id, import_quotes(request_id)')
            .eq('id', payment.related_id)
            .single()

        if (order?.import_quotes) {
            await supabaseAdmin
                .from('import_requests')
                .update({ status: 'paid' })
                .eq('id', (order.import_quotes as any).request_id)
        }
    }

    if (payment.type === 'promotion' && payment.related_id) {
        // Activate the listing promotion
        await supabaseAdmin
            .from('promotions')
            .update({
                is_active: true,
                payment_id: payment.id,
            })
            .eq('id', payment.related_id)
    }
}
