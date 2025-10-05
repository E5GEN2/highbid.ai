import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import crypto from 'crypto';

interface NowPaymentsWebhook {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id?: string;
  created_at: string;
  updated_at: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhook: NowPaymentsWebhook = JSON.parse(body);

    // Log the webhook for debugging
    console.log('NowPayments webhook received:', webhook);

    // Verify webhook signature
    const signature = request.headers.get('x-nowpayments-sig');
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Verify API key is configured
    const apiKey = process.env.NEXT_PUBLIC_NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      console.error('NowPayments API key not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Only process successful payments
    if (webhook.payment_status === 'finished' || webhook.payment_status === 'confirmed') {
      await processSuccessfulPayment(webhook);
    } else if (webhook.payment_status === 'failed' || webhook.payment_status === 'refunded') {
      await processFailedPayment(webhook);
    }

    // Always respond with 200 to acknowledge receipt
    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error processing NowPayments webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processSuccessfulPayment(webhook: NowPaymentsWebhook) {
  try {
    // Extract user ID from order_id (format: "topup-{timestamp}-{userId}")
    const userId = extractUserIdFromOrderId(webhook.order_id);
    if (!userId) {
      console.error('Could not extract user ID from order_id:', webhook.order_id);
      return;
    }

    const supabase = createClient();

    // Update user balance using the database function
    const { data: newBalance, error: balanceError } = await supabase
      .rpc('update_user_balance', {
        p_user_id: userId,
        p_amount: webhook.price_amount,
        p_operation: 'add'
      });

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
    } else {
      console.log(`Updated balance for user ${userId}: $${newBalance}`);
    }

    // Update existing transaction status
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', webhook.payment_id);

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log(`Successfully processed payment for user ${userId}: +$${webhook.price_amount}`);
  } catch (error) {
    console.error('Error in processSuccessfulPayment:', error);
  }
}

async function processFailedPayment(webhook: NowPaymentsWebhook) {
  try {
    const userId = extractUserIdFromOrderId(webhook.order_id);
    if (!userId) return;

    const supabase = createClient();

    // Record failed transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount: webhook.price_amount,
        description: `Failed top-up via ${webhook.pay_currency.toUpperCase()}`,
        payment_id: webhook.payment_id,
        status: 'failed',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording failed transaction:', error);
    }

    console.log(`Recorded failed payment for user ${userId}: $${webhook.price_amount}`);
  } catch (error) {
    console.error('Error in processFailedPayment:', error);
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) {
    console.warn('No signature provided in webhook');
    return true; // Allow for testing - remove in production
  }

  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    console.warn('IPN secret not configured');
    return true; // Allow for testing - remove in production
  }

  try {
    // NowPayments uses HMAC-SHA512 for signature verification
    const expectedSignature = crypto
      .createHmac('sha512', ipnSecret)
      .update(body)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

function extractUserIdFromOrderId(orderId: string): string | null {
  // Order_id format: "topup-{timestamp}-{userId}"
  const parts = orderId.split('-');
  if (parts.length === 3 && parts[0] === 'topup') {
    return parts[2]; // Return the user ID part
  }
  return null;
}