// test-portal-access.ts
// This script tests Stripe payment flow with a test Mastercard number (4242 4242 4242 4242).
// Ensure you have STRIPE_SECRET_KEY set in .env.local (test key).

import Stripe from "stripe";
import dotenv from "dotenv"; // eslint-disable-next-line import/no-extraneous-dependencies

dotenv.config({ path: ".env.local" });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY not found in environment variables.");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" });

async function runTest() {
  try {
    // 1. Create a test customer
    const customer = await stripe.customers.create({
      description: "Test customer for portal access",
      email: "test@example.com",
    });
    console.log("Created test customer:", customer.id);

    // 2. Create a payment method using test card number 4242424242424242
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: "4242424242424242",
        exp_month: 12,
        exp_year: 2025,
        cvc: "123",
      },
    });
    console.log("Created payment method:", paymentMethod.id);

    // 3. Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
    // Set it as default
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });
    console.log("Attached payment method to customer.");

    // 4. Create a payment intent for a small amount (e.g., $1.00)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 in cents
      currency: "usd",
      customer: customer.id,
      payment_method: paymentMethod.id,
      confirm: true,
      off_session: true,
    });
    console.log("Payment intent status:", paymentIntent.status);
    if (paymentIntent.status === "succeeded") {
      console.log("✅ Test payment succeeded! Portal access flow works.");
    } else {
      console.warn("⚠️ Payment did not succeed. Status:", paymentIntent.status);
    }
  } catch (error: any) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  }
}

runTest();
