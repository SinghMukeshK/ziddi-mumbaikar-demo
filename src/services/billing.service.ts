import { apiV1 } from '@/lib/api-v1'

export interface Invoice {
    id: string
    invoice_number: string
    status: 'open' | 'paid' | 'past_due' | 'void'
    subtotal: number
    tax_total: number
    total: number
    amount_paid: number
    amount_remaining: number
    due_date: string
    created_at: string
    currency: string
    billing_reason: string
}

export interface Subscription {
    id: string
    plan_id: string
    status: 'active' | 'past_due' | 'cancelled' | 'trialing'
    billing_cycle: 'monthly' | 'annually'
    current_period_start: string
    current_period_end: string
    next_billing_date: string
    plan?: {
        name: string
        monthly_price: number
        annual_price: number
        currency: string
    }
}

export interface ApiResponse<T = any> {
    success: boolean
    data: T
    message?: string
}

class BillingService {
    async getCurrentSubscription(): Promise<ApiResponse<Subscription>> {
        return apiV1.get<ApiResponse<Subscription>>('/billing/subscription')
    }

    async getInvoices(page = 1, limit = 10): Promise<ApiResponse<Invoice[]>> {
        return apiV1.get<ApiResponse<Invoice[]>>('/billing/invoices', {
            params: { page, limit }
        })
    }

    async getInvoiceDetails(id: string): Promise<ApiResponse<Invoice>> {
        return apiV1.get<ApiResponse<Invoice>>(`/billing/invoices/${id}`)
    }
}

export const billingService = new BillingService()
