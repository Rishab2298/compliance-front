import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'

const BillingCancel = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Transaction Cancelled</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Cancel Message */}
            <section className="bg-white rounded-[10px] p-8 border border-gray-200 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-100 rounded-[10px]">
                  <XCircle className="w-12 h-12 text-gray-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Transaction Cancelled
              </h2>

              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your payment was cancelled and no charges were made to your account.
                You can return to billing to try again or choose a different plan.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/client/billing')}
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-[10px]"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Return to Billing
                </Button>

                <Button
                  onClick={() => navigate('/client/dashboard')}
                  variant="outline"
                  className="rounded-[10px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </section>

            {/* Help Section */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-700">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Having payment issues?</p>
                    <p className="text-gray-500">Try using a different payment method or contact your bank.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-700">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Not sure which plan to choose?</p>
                    <p className="text-gray-500">Review our plan comparison to find the best fit for your needs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-700">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Questions about pricing?</p>
                    <p className="text-gray-500">Contact our support team at <span className="font-medium text-gray-900">support@logilink.com</span></p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingCancel
