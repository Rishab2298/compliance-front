import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

const BillingSuccess = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Invalidate billing queries to refresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['currentPlan'] })
    queryClient.invalidateQueries({ queryKey: ['billingHistory'] })
  }, [queryClient])

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Payment Successful</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <section className="bg-white rounded-[10px] p-8 border border-gray-200 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-100 rounded-[10px]">
                  <CheckCircle className="w-12 h-12 text-gray-800" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Payment Successful!
              </h2>

              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your payment has been processed successfully. Your account has been updated
                with your new plan and features.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/client/dashboard')}
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-[10px]"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => navigate('/client/billing')}
                  variant="outline"
                  className="rounded-[10px]"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  View Billing
                </Button>
              </div>
            </section>

            {/* Next Steps */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-700">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Your plan is now active</p>
                    <p className="text-gray-500">All features from your new plan are immediately available.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-700">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Receipt sent to your email</p>
                    <p className="text-gray-500">A confirmation email with your receipt has been sent to your registered email address.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-700">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage your subscription</p>
                    <p className="text-gray-500">View your billing details, invoices, and payment methods in the billing section.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Support */}
            <section className="bg-gray-50 rounded-[10px] p-4 border border-gray-200 mt-6">
              <p className="text-sm text-gray-700 text-center">
                Need help? Contact us at{' '}
                <span className="font-medium text-gray-900">support@logilink.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingSuccess
