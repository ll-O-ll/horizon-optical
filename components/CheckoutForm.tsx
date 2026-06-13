"use client";

import React, { useEffect, useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CheckoutForm({ amount, onPaymentSuccess, onStashBookingData }: {
    amount: number;
    onPaymentSuccess?: () => Promise<void>;
    onStashBookingData?: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) return;

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );
        if (!clientSecret) return;

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        // Stash booking data in sessionStorage BEFORE attempting payment,
        // in case the payment method requires a redirect (e.g. 3D Secure).
        if (onStashBookingData) {
            onStashBookingData();
        }

        // Use redirect: 'if_required' so regular card payments resolve
        // without a redirect, letting us save the booking only after success.
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking`,
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message ?? "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
            return;
        }

        // Payment succeeded (no redirect) — now save the booking
        if (paymentIntent?.status === "succeeded" && onPaymentSuccess) {
            try {
                await onPaymentSuccess();
            } catch (err) {
                console.error("Failed to save booking after payment:", err);
                setMessage("Payment succeeded but failed to save booking. Please contact support.");
            }
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs" as const,
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={paymentElementOptions} />

            {/* Show any error or success messages */}
            {message && <div id="payment-message" className="text-red-500 text-sm">{message}</div>}

            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
                <span id="button-text">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Pay $${amount}`
                    )}
                </span>
            </Button>
        </form>
    );
}
