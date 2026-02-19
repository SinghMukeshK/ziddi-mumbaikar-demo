// Type declarations for Razorpay browser SDK
// Loaded dynamically via script tag from https://checkout.razorpay.com/v1/checkout.js

interface RazorpayOptions {
    key: string;
    amount: number; // in paise (INR * 100)
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    handler?: (response: RazorpayPaymentResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
        confirm_close?: boolean;
        escape?: boolean;
    };
}

interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open(): void;
    close(): void;
    on(event: string, handler: Function): void;
}

interface RazorpayConstructor {
    new(options: RazorpayOptions): RazorpayInstance;
}

interface Window {
    Razorpay: RazorpayConstructor;
}
