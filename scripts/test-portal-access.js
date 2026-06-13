// test-portal-access.js
// Script to verify Stripe payment flow using test Mastercard number (4242 4242 4242 4242).
// Requires STRIPE_SECRET_KEY (test) in .env.local.


const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

(async () => {
  try {
    // 1. Create a test customer
    const customer = await stripe.customers.create({
      description: 'Test customer for portal access',
      email: 'test@example.com',
    });
    console.log('Created test customer:', customer.id);

    // 2. Create a payment method using the Stripe test token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_visa' },
    });
    const paymentMethodId = paymentMethod.id;
    console.log('Created payment method:', paymentMethodId);

    // 3. Attach to customer and set as default
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    console.log('Attached payment method to customer');

    // 4. Create a $1.00 payment intent and confirm
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    });
    console.log('Payment intent status:', paymentIntent.status);
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Test payment succeeded! Portal access flow works.');
    } else {
      console.warn('⚠️ Payment not successful. Status:', paymentIntent.status);
    }
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
})();
