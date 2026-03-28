// steps/Step6Payment.jsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

// Use environment variable for Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ formData, onSubmit, onPrev, isSubmitting }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }
        
        setProcessing(true);
        setError("");
        
        try {
            // Create payment intent on your server
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: 5000, // $50.00 in cents
                    currency: "usd",
                    metadata: {
                        projectTitle: formData.projectTitle,
                        projectType: formData.projectType,
                        email: formData.email,
                    }
                }),
            });
            
            const { clientSecret, error: apiError } = await response.json();
            
            if (apiError) {
                throw new Error(apiError);
            }
            
            // Confirm the payment
            const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: formData.projectTitle,
                        email: formData.email,
                    },
                },
            });
            
            if (paymentError) {
                setError(paymentError.message);
                setProcessing(false);
            } else if (paymentIntent.status === "succeeded") {
                // Payment successful, submit the form
                await onSubmit(paymentIntent.id);
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError(err.message || "An error occurred while processing your payment.");
            setProcessing(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Submission Fee</h3>
                    <p className="text-3xl font-bold text-[#1EB97A]">$50.00</p>
                    <p className="text-sm text-gray-600 mt-1">One-time payment for project submission</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Details
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-white">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: "16px",
                                        color: "#424770",
                                        "::placeholder": {
                                            color: "#aab7c4",
                                        },
                                        padding: "10px 12px",
                                    },
                                    invalid: {
                                        color: "#9e2146",
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
                
                {error && (
                    <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}
                
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We use Stripe to process payments.
                    </p>
                </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={onPrev}
                    className="px-6 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    disabled={isSubmitting || processing}
                >
                    ← Previous
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing || isSubmitting}
                    className="bg-[#1EB97A] hover:bg-[#189663] text-white px-6 py-2.5 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {processing || isSubmitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                        </>
                    ) : (
                        "Pay $50 & Submit"
                    )}
                </button>
            </div>
        </form>
    );
};

export default function Step6Payment({ formData, updateFormData, onSubmit, onPrev, isSubmitting }) {
    // Make sure Stripe is initialized
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                    Stripe is not configured. Please add your Stripe public key to environment variables.
                </div>
                <button
                    onClick={onPrev}
                    className="px-6 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50"
                >
                    ← Previous
                </button>
            </div>
        );
    }
    
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm
                formData={formData}
                onSubmit={onSubmit}
                onPrev={onPrev}
                isSubmitting={isSubmitting}
            />
        </Elements>
    );
}