import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  Loader2,
} from 'lucide-react'
import {
  useCurrentPlan,
  usePlans,
  useUpgradePlan,
  usePurchaseCredits,
  useBillingHistory,
} from '@/hooks/useBilling'
import { toast } from 'sonner'
import CreditPurchaseModal from '@/components/CreditPurchaseModal'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import { DashboardHeader } from '@/components/DashboardHeader'

const Billing = () => {
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const [billingInterval, setBillingInterval] = useState('monthly')
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(null) // Track which plan is loading

  // Fetch data
  const { data: currentPlanData, isLoading: currentPlanLoading } = useCurrentPlan()
  const { data: availablePlans = [], isLoading: plansLoading } = usePlans()
  const { data: billingHistoryData = [], isLoading: billingHistoryLoading } = useBillingHistory()

  // Mutations
  const upgradeMutation = useUpgradePlan()
  const purchaseCreditsMutation = usePurchaseCredits()

  const loading = currentPlanLoading || plansLoading

  // Transform data
  const currentPlan = currentPlanData ? {
    name: currentPlanData.currentPlan?.name || 'Free',
    price: currentPlanData.currentPlan?.price || 0,
    yearlyPrice: currentPlanData.currentPlan?.yearlyPrice || 0,
    status: currentPlanData.billing?.subscriptionStatus?.toLowerCase() || 'active',
    nextBillingDate: currentPlanData.billing?.nextBillingDate,
    drivers: {
      current: currentPlanData.usage?.drivers?.current || 0,
      limit: currentPlanData.usage?.drivers?.limit || 0,
    },
    aiCredits: {
      current: currentPlanData.usage?.aiCredits?.current || 0,
      monthly: currentPlanData.usage?.aiCredits?.monthlyAllotment || 0,
    },
  } : null

  // Separate free and paid plans
  const freePlan = availablePlans.find(p => p.name === 'Free')
  const paidPlans = availablePlans.filter(p => p.name !== 'Free')

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getUsagePercentage = (current, limit) => {
    if (limit === -1 || limit === 0) return 0
    return (current / limit) * 100
  }

  const handlePurchaseCredits = async (amount) => {
    try {
      const result = await purchaseCreditsMutation.mutateAsync(amount)
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      toast.error('Failed to purchase credits', {
        description: error.message,
      })
    } finally {
      setShowCreditModal(false)
    }
  }

  const handleChangePlan = async (planName) => {
    if (!currentPlan) return

    if (planName === currentPlan.name) {
      toast.info('You are already on this plan')
      return
    }

    if (planName === 'Enterprise') {
      toast.info('Contact sales for Enterprise pricing', {
        description: 'Email us at sales@complyo.io',
      })
      return
    }

    setLoadingPlan(planName) // Set loading for this specific plan

    try {
      const planTiers = ['Free', 'Starter', 'Professional', 'Enterprise']
      const currentIndex = planTiers.indexOf(currentPlan.name)
      const targetIndex = planTiers.indexOf(planName)

      if (targetIndex > currentIndex) {
        const result = await upgradeMutation.mutateAsync({
          targetPlan: planName,
          billingCycle: billingInterval,
        })

        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        }
      } else {
        toast.info('Downgrades not available in UI', {
          description: 'Contact support to downgrade',
        })
      }
    } catch (error) {
      toast.error('Failed to change plan', {
        description: error.message,
      })
    } finally {
      setLoadingPlan(null) // Clear loading state
    }
  }


  const driversPercentage = currentPlan ? getUsagePercentage(
    currentPlan.drivers.current,
    currentPlan.drivers.limit
  ) : 0
  const creditsLow = currentPlan ? currentPlan.aiCredits.current < 5 : false

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
      <DashboardHeader title="Billing">
        {loading ? (
          <Skeleton className="h-6 w-20 rounded-[10px]" />
        ) : currentPlan ? (
          <Badge className={`rounded-[10px] text-xs ${getThemeClasses.badge.success(isDarkMode)}`}>
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
          </Badge>
        ) : null}
      </DashboardHeader>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Overview Section */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Current Plan</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Your subscription and usage details</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Current Plan Box */}
              <div className={`p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`mb-3 text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Plan</p>
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-24 mb-2 rounded-[10px]" />
                    <Skeleton className="h-5 w-20 rounded-[10px]" />
                  </>
                ) : currentPlan ? (
                  <>
                    <p className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{currentPlan.name}</p>
                    {currentPlan.name !== 'Free' && (
                      <p className={`mt-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        ${billingInterval === 'monthly' ? currentPlan.price : currentPlan.yearlyPrice}
                        <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>/{billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                      </p>
                    )}
                    {currentPlan.nextBillingDate && (
                      <p className={`mt-3 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Next billing: {formatDate(currentPlan.nextBillingDate)}
                      </p>
                    )}
                  </>
                ) : null}
              </div>

              {/* Drivers Usage Box */}
              <div className={`p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Drivers</p>
                  {loading ? (
                    <Skeleton className="h-4 w-8 rounded-[10px]" />
                  ) : (
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      {driversPercentage.toFixed(0)}%
                    </span>
                  )}
                </div>
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-32 mb-4 rounded-[10px]" />
                    <Skeleton className="w-full h-2 rounded-full" />
                  </>
                ) : currentPlan ? (
                  <>
                    <p className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {currentPlan.drivers.current}
                      <span className={`ml-1 text-base font-normal ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        / {currentPlan.drivers.limit === -1 ? '∞' : currentPlan.drivers.limit}
                      </span>
                    </p>
                    <div className={`w-full h-2 mt-4 overflow-hidden rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full transition-all rounded-full ${
                          driversPercentage >= 90
                            ? isDarkMode ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600' : 'bg-gray-900'
                            : driversPercentage >= 75
                            ? isDarkMode ? 'bg-violet-600' : 'bg-gray-700'
                            : isDarkMode ? 'bg-violet-500' : 'bg-gray-600'
                        }`}
                        style={{ width: `${Math.min(driversPercentage, 100)}%` }}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              {/* AI Credits Box */}
              <div className={`p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>AI Credits</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCreditModal(true)}
                    disabled={loading}
                    className={`h-7 text-xs font-medium rounded-[10px] -mr-2 ${isDarkMode ? 'text-violet-400 hover:text-violet-300 hover:bg-slate-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    Buy More
                  </Button>
                </div>
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-32 mb-3 rounded-[10px]" />
                    <Skeleton className="h-4 w-40 rounded-[10px]" />
                  </>
                ) : currentPlan ? (
                  <>
                    <p className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {currentPlan.aiCredits.current}
                      <span className={`ml-1 text-base font-normal ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>available</span>
                    </p>
                    {currentPlan.aiCredits.monthly > 0 && (
                      <p className={`mt-3 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {currentPlan.aiCredits.monthly} credits refill monthly
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </section>

          {/* Low Credits Alert */}
          {creditsLow && (
            <section className={`rounded-[10px] border p-4 ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-gray-600'}`} />
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Running Low on Credits</h3>
                  <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    You have less than 5 AI credits remaining. Purchase more to continue scanning documents.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreditModal(true)}
                  className={`rounded-[10px] flex-shrink-0 ${getThemeClasses.button.primary(isDarkMode)}`}
                >
                  Buy Credits
                </Button>
              </div>
            </section>
          )}

          {/* Plans Section */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Available Plans</h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Choose the plan that fits your needs</p>
              </div>

              {/* Billing Toggle */}
              <div className={`flex items-center gap-1 p-1 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-4 py-1.5 rounded-[8px] text-sm font-medium transition-all ${
                    billingInterval === 'monthly'
                      ? isDarkMode
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-white text-gray-900 border border-gray-200'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-4 py-1.5 rounded-[8px] text-sm font-medium transition-all flex items-center gap-1.5 ${
                    billingInterval === 'yearly'
                      ? isDarkMode
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-white text-gray-900 border border-gray-200'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>-20%</span>
                </button>
              </div>
            </div>

            {/* Paid Plans Grid */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
              {loading ? (
                // Show skeleton plan cards while loading
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`relative p-6 rounded-[10px] border transition-all flex flex-col ${
                      isDarkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="mb-6">
                      <Skeleton className="h-6 w-24 mb-2 rounded-[10px]" />
                      <Skeleton className="h-10 w-20 rounded-[10px]" />
                    </div>
                    <div className="space-y-2.5 mb-6">
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                    </div>
                    <div className="flex-1" />
                    <Skeleton className="h-10 w-full rounded-[10px]" />
                  </div>
                ))
              ) : currentPlan ? (
                paidPlans.map((plan) => {
                const isCurrent = currentPlan.name === plan.name
                const isPopular = plan.name === 'Professional'

                const isLoading = loadingPlan === plan.name

                return (
                  <div
                    key={plan.name}
                    className={`relative p-6 rounded-[10px] border transition-all flex flex-col ${
                      isCurrent
                        ? isDarkMode
                          ? 'bg-slate-800/50 border-violet-500 shadow-lg shadow-violet-500/20'
                          : 'bg-gray-50 border-gray-800'
                        : isDarkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {isPopular && !isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className={`text-xs font-medium px-3 py-1 rounded-bl-[10px] rounded-tr-[10px] ${isDarkMode ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white' : 'bg-gray-800 text-white'}`}>
                          Popular
                        </div>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className={`text-xs font-medium px-3 py-1 rounded-bl-[10px] rounded-tr-[10px] ${isDarkMode ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white' : 'bg-gray-800 text-white'}`}>
                          Current
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className={`mb-2 text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{plan.name}</h3>
                      {plan.name === 'Enterprise' ? (
                        <p className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>Custom</p>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                            ${billingInterval === 'monthly' ? plan.price : plan.yearlyPrice}
                          </span>
                          <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      )}
                      {billingInterval === 'yearly' && plan.name !== 'Enterprise' && (
                        <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                          Save ${(plan.price * 12 - plan.yearlyPrice).toFixed(0)}/year
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <span>
                          {plan.maxDrivers === -1 ? 'Unlimited' : `${plan.maxDrivers}`} drivers
                        </span>
                      </li>
                      <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <span>
                          {plan.maxDocumentsPerDriver === -1 ? 'Unlimited' : plan.maxDocumentsPerDriver} docs per driver
                        </span>
                      </li>
                      <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <span>
                          {plan.monthlyAICredits === -1 ? 'Unlimited' : `${plan.monthlyAICredits}`} AI credits/mo
                        </span>
                      </li>
                      <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <span>{plan.features?.sms ? 'Email + SMS' : 'Email'} reminders</span>
                      </li>
                      {plan.name === 'Professional' && (
                        <>
                          <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                            <span>Priority support</span>
                          </li>
                          <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                            <span>Advanced analytics</span>
                          </li>
                        </>
                      )}
                      {plan.name === 'Enterprise' && (
                        <>
                          <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                            <span>Dedicated support</span>
                          </li>
                          <li className={`flex items-start gap-2 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                            <span>Custom integrations</span>
                          </li>
                        </>
                      )}
                    </ul>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1" />

                    <Button
                      className={`w-full rounded-[10px] ${
                        isCurrent
                          ? isDarkMode
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed hover:bg-slate-700'
                            : 'bg-gray-200 text-gray-600 cursor-not-allowed hover:bg-gray-200'
                          : getThemeClasses.button.primary(isDarkMode)
                      }`}
                      onClick={() => handleChangePlan(plan.name)}
                      disabled={isCurrent || loadingPlan !== null}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : plan.name === 'Enterprise' ? (
                        <>
                          Contact Sales <ExternalLink className="w-4 h-4 ml-1.5" />
                        </>
                      ) : (
                        <>
                          Upgrade <ChevronRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                )
              })
              ) : null}
            </div>

            {/* Free Plan - Full Width */}
            {loading ? (
              <div className={`p-6 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-5 rounded-[10px]" />
                    <Skeleton className="h-4 w-64 mb-5 rounded-[10px]" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <Skeleton className="w-4 h-4 mt-1 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24 rounded-[10px]" />
                            <Skeleton className="h-3 w-20 rounded-[10px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-8 text-right">
                    <Skeleton className="h-10 w-16 mb-1 rounded-[10px]" />
                    <Skeleton className="h-4 w-24 rounded-[10px]" />
                  </div>
                </div>
              </div>
            ) : freePlan && currentPlan ? (
              <div className={`p-6 rounded-[10px] border ${
                currentPlan.name === 'Free'
                  ? isDarkMode
                    ? 'bg-slate-800/50 border-violet-500 shadow-lg shadow-violet-500/20'
                    : 'bg-gray-50 border-gray-800'
                  : isDarkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{freePlan.name}</h3>
                      {currentPlan.name === 'Free' && (
                        <Badge className={`rounded-[10px] text-xs ${isDarkMode ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className={`max-w-2xl mb-5 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Perfect for trying out Complyo. Get started with basic features at no cost.
                    </p>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className={`flex-shrink-0 w-4 h-4 mt-1 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{freePlan.maxDrivers} Drivers</p>
                          <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>Limited capacity</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className={`flex-shrink-0 w-4 h-4 mt-1 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{freePlan.maxDocumentsPerDriver} Doc per Driver</p>
                          <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>Basic tracking</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className={`flex-shrink-0 w-4 h-4 mt-1 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{freePlan.initialAICredits} AI Credits</p>
                          <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>One-time only</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className={`flex-shrink-0 w-4 h-4 mt-1 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Email Reminders</p>
                          <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>Basic alerts</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-8 text-right">
                    <p className={`mb-1 text-4xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>$0</p>
                    <p className={`mb-4 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Forever free</p>
                    {currentPlan.name !== 'Free' && (
                      <Button variant="outline" disabled className={`opacity-50 rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}>
                        Contact Support
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Billing History & Invoices */}
            <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Invoices & Billing History</h3>
                  {billingHistoryLoading ? (
                    <Skeleton className="h-3 w-32 mt-1 rounded-[10px]" />
                  ) : (
                    <p className={`text-xs mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      {billingHistoryData.length > 0 ? `${billingHistoryData.length} total transactions` : 'No transactions yet'}
                    </p>
                  )}
                </div>
              </div>

              {billingHistoryLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-[10px] border ${
                        isDarkMode
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center flex-1 gap-3">
                        <Skeleton className="w-8 h-8 rounded-[10px]" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-32 rounded-[10px]" />
                            <Skeleton className="h-5 w-16 rounded-[6px]" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-24 rounded-[10px]" />
                            <Skeleton className="h-3 w-20 rounded-[10px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16 rounded-[10px]" />
                        <Skeleton className="h-8 w-8 rounded-[10px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : billingHistoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`p-3 rounded-[10px] mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <FileText className={`w-6 h-6 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                  </div>
                  <p className={`mb-1 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>No invoices yet</p>
                  <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Your billing history will appear here after your first transaction
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billingHistoryData.map((invoice) => (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between p-3 rounded-[10px] border transition-colors ${
                        isDarkMode
                          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-violet-500/30'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center flex-1 gap-3">
                        <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                          <FileText className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>{invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}</p>
                            <Badge className={`text-xs rounded-[6px] ${
                              invoice.status === 'PAID'
                                ? getThemeClasses.badge.success(isDarkMode)
                                : isDarkMode ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {invoice.status || 'PAID'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{formatDate(invoice.paidAt || invoice.createdAt)}</p>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                            {invoice.plan ? (
                              <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{invoice.plan} Plan</p>
                            ) : (
                              <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Credit Purchase</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>${invoice.amount?.toFixed(2) || '0.00'}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 rounded-[10px] ${isDarkMode ? 'hover:bg-slate-700 hover:text-violet-400' : 'hover:bg-gray-200'}`}
                          onClick={() => {
                            window.open(`/client/billing/invoice/${invoice.id}`, '_blank')
                          }}
                          title="View Invoice"
                        >
                          <Eye className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </div>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onPurchase={handlePurchaseCredits}
        isLoading={purchaseCreditsMutation.isPending}
      />
    </div>
  )
}

export default Billing
