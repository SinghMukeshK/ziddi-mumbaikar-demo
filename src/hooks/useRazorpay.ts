'use client'

import { useEffect, useState, useCallback } from 'react'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export function useRazorpay() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const loadScript = useCallback(() => {
        return new Promise<boolean>((resolve) => {
            // Already loaded
            if (typeof window !== 'undefined' && window.Razorpay) {
                setIsLoaded(true)
                resolve(true)
                return
            }

            // Script already in DOM
            const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)
            if (existingScript) {
                existingScript.addEventListener('load', () => {
                    setIsLoaded(true)
                    resolve(true)
                })
                return
            }

            setIsLoading(true)
            const script = document.createElement('script')
            script.src = RAZORPAY_SCRIPT_URL
            script.async = true
            script.onload = () => {
                setIsLoaded(true)
                setIsLoading(false)
                resolve(true)
            }
            script.onerror = () => {
                setIsLoading(false)
                resolve(false)
            }
            document.body.appendChild(script)
        })
    }, [])

    useEffect(() => {
        // Pre-load the script when the hook is first used
        loadScript()
    }, [loadScript])

    const openRazorpay = useCallback(
        async (options: Omit<RazorpayOptions, 'handler'>): Promise<RazorpayPaymentResponse> => {
            const loaded = await loadScript()
            if (!loaded) {
                throw new Error('Failed to load Razorpay SDK. Please check your internet connection.')
            }

            return new Promise((resolve, reject) => {
                const rzp = new window.Razorpay({
                    ...options,
                    handler: (response: RazorpayPaymentResponse) => {
                        resolve(response)
                    },
                    modal: {
                        ...options.modal,
                        ondismiss: () => {
                            reject(new Error('Payment cancelled by user'))
                        },
                    },
                })
                rzp.open()
            })
        },
        [loadScript]
    )

    return { isLoaded, isLoading, openRazorpay }
}
