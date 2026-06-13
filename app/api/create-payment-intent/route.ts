import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-01-28.clover" as any, // Cast to any to handle dev environment version mismatches safely
      })
    : null;


export async function POST(request: Request) {
    try {
        if (!stripe) {
            return NextResponse.json(
                { error: "Stripe is not configured on this server." },
                { status: 500 }
            );
        }

        const { amount, currency } = await request.json();

        if (!amount || !currency) {
            return NextResponse.json(
                { error: "Amount and currency are required" },
                { status: 400 }
            );
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: currency,
            automatic_payment_methods: { enabled: true },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error("Internal Error:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
