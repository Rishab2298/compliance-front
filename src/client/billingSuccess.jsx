import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'

const BillingSuccess = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isDarkMode } = useTheme()

  // Invalidate billing queries to refresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['currentPlan'] })
    queryClient.invalidateQueries({ queryKey: ['billingHistory'] })
  }, [queryClient])

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
          <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>
        </>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Payment Successful</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 py-8 ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <div className="container w-full px-6 mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <section className={`rounded-[10px] p-8 border text-center ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <CheckCircle className={`w-12 h-12 ${isDarkMode ? 'text-violet-400' : 'text-gray-800'}`} />
                </div>
              </div>

              <h2 className={`text-2xl font-bold mb-3 ${getThemeClasses.text.primary(isDarkMode)}`}>
                Payment Successful!
              </h2>

              <p className={`mb-6 max-w-md mx-auto ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Your payment has been processed successfully. Your account has been updated
                with your new plan and features.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate('/client/dashboard')}
                  className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => navigate('/client/billing')}
                  variant="outline"
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  View Billing
                </Button>
              </div>
            </section>

            {/* Next Steps */}
            <section className={`rounded-[10px] p-6 border mt-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
              <h3 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>What's Next?</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>1</span>
                  </div>
                  <div>
                    <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Your plan is now active</p>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>All features from your new plan are immediately available.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>2</span>
                  </div>
                  <div>
                    <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Receipt sent to your email</p>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>A confirmation email with your receipt has been sent to your registered email address.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>3</span>
                  </div>
                  <div>
                    <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Manage your subscription</p>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>View your billing details, invoices, and payment methods in the billing section.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Support */}
            <section className={`rounded-[10px] p-4 border mt-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm text-center ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Need help? Contact us at{' '}
                <span className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>support@complyo.co</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingSuccess
