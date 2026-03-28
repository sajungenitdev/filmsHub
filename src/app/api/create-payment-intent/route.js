// app/api/create-payment-intent/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { amount, currency, metadata } = await request.json();
        
        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        // Return the client secret to the client
        return NextResponse.json({ 
            clientSecret: paymentIntent.client_secret 
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}