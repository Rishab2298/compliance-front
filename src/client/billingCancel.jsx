import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'

const BillingCancel = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

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
          <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Transaction Cancelled</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 py-8 ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <div className="container w-full px-6 mx-auto">
          <div className="max-w-2xl mx-auto">
            {/* Cancel Message */}
            <section className={`rounded-[10px] p-8 border text-center ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <XCircle className={`w-12 h-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-600'}`} />
                </div>
              </div>

              <h2 className={`text-2xl font-bold mb-3 ${getThemeClasses.text.primary(isDarkMode)}`}>
                Transaction Cancelled
              </h2>

              <p className={`mb-6 max-w-md mx-auto ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Your payment was cancelled and no charges were made to your account.
                You can return to billing to try again or choose a different plan.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate('/client/billing')}
                  className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Return to Billing
                </Button>

                <Button
                  onClick={() => navigate('/client/dashboard')}
                  variant="outline"
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </section>

            {/* Help Section */}
            <section className={`rounded-[10px] p-6 border mt-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
              <h3 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>Need Help?</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>1</span>
                  </div>
                  <div>
                    <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Having payment issues?</p>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>Try using a different payment method or contact your bank.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>2</span>
                  </div>
                  <div>
                    <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Not sure which plan to choose?</p>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>Review our plan comparison to find the best fit for your needs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>3</span>
                  </div>
                  <div>
                    <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Questions about pricing?</p>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>Contact our support team at <span className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>support@complyo.io</span></p>
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
