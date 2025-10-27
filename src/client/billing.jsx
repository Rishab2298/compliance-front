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

const Billing = () => {
  const { user } = useUser()
  const [billingInterval, setBillingInterval] = useState('monthly')
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(null) // Track which plan is loading

  // Fetch data
  const { data: currentPlanData, isLoading: currentPlanLoading } = useCurrentPlan()
  const { data: availablePlans = [], isLoading: plansLoading } = usePlans()
  const { data: billingHistoryData = [] } = useBillingHistory()

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
        description: 'Email us at sales@logilink.com',
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

  if (loading || !currentPlan) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <Skeleton className="h-6 w-24 rounded-[10px]" />
            <Skeleton className="h-6 w-20 rounded-[10px]" />
          </div>
        </header>

        {/* Main Content Skeleton */}
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Overview Section Skeleton */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <Skeleton className="h-6 w-32 mb-2 rounded-[10px]" />
              <Skeleton className="h-4 w-64 mb-6 rounded-[10px]" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16 rounded-[10px]" />
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                  <Skeleton className="h-4 w-24 rounded-[10px]" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16 rounded-[10px]" />
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20 rounded-[10px]" />
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                  <Skeleton className="h-4 w-28 rounded-[10px]" />
                </div>
              </div>
            </section>

            {/* Plans Section Skeleton */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <Skeleton className="h-6 w-40 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-56 rounded-[10px]" />
                </div>
                <Skeleton className="h-10 w-48 rounded-[10px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-[10px] border border-gray-200">
                    <Skeleton className="h-6 w-24 mb-4 rounded-[10px]" />
                    <Skeleton className="h-10 w-20 mb-6 rounded-[10px]" />
                    <div className="space-y-2 mb-6">
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                      <Skeleton className="h-4 w-full rounded-[10px]" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-[10px]" />
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Section Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-[10px] p-6 border border-gray-200">
                <Skeleton className="h-6 w-32 mb-4 rounded-[10px]" />
                <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                  <Skeleton className="h-16 w-full rounded-[10px]" />
                </div>
              </section>
              <section className="bg-white rounded-[10px] p-6 border border-gray-200">
                <Skeleton className="h-6 w-32 mb-4 rounded-[10px]" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-[10px] border border-gray-200">
                      <Skeleton className="h-12 w-full rounded-[10px]" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 rounded-[10px] text-xs">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Overview Section */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              <p className="mt-1 text-sm text-gray-500">Your subscription and usage details</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Current Plan Box */}
              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <p className="mb-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Plan</p>
                <p className="text-3xl font-bold text-gray-900">{currentPlan.name}</p>
                {currentPlan.name !== 'Free' && (
                  <p className="mt-2 text-sm text-gray-600">
                    ${billingInterval === 'monthly' ? currentPlan.price : currentPlan.yearlyPrice}
                    <span className="text-gray-400">/{billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                  </p>
                )}
                {currentPlan.nextBillingDate && (
                  <p className="mt-3 text-xs text-gray-500">
                    Next billing: {formatDate(currentPlan.nextBillingDate)}
                  </p>
                )}
              </div>

              {/* Drivers Usage Box */}
              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Drivers</p>
                  <span className="text-xs font-semibold text-gray-400">
                    {driversPercentage.toFixed(0)}%
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {currentPlan.drivers.current}
                  <span className="ml-1 text-base font-normal text-gray-400">
                    / {currentPlan.drivers.limit === -1 ? '∞' : currentPlan.drivers.limit}
                  </span>
                </p>
                <div className="w-full h-2 mt-4 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full transition-all rounded-full ${
                      driversPercentage >= 90 ? 'bg-gray-900' :
                      driversPercentage >= 75 ? 'bg-gray-700' : 'bg-gray-600'
                    }`}
                    style={{ width: `${Math.min(driversPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* AI Credits Box */}
              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">AI Credits</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCreditModal(true)}
                    className="h-7 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-[10px] -mr-2"
                  >
                    Buy More
                  </Button>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {currentPlan.aiCredits.current}
                  <span className="ml-1 text-base font-normal text-gray-400">available</span>
                </p>
                {currentPlan.aiCredits.monthly > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    {currentPlan.aiCredits.monthly} credits refill monthly
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Low Credits Alert */}
          {creditsLow && (
            <section className="bg-gray-50 rounded-[10px] border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Running Low on Credits</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    You have less than 5 AI credits remaining. Purchase more to continue scanning documents.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreditModal(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] flex-shrink-0"
                >
                  Buy Credits
                </Button>
              </div>
            </section>
          )}

          {/* Plans Section */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
                <p className="mt-1 text-sm text-gray-500">Choose the plan that fits your needs</p>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-[10px]">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-4 py-1.5 rounded-[8px] text-sm font-medium transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-white text-gray-900 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-4 py-1.5 rounded-[8px] text-sm font-medium transition-all flex items-center gap-1.5 ${
                    billingInterval === 'yearly'
                      ? 'bg-white text-gray-900 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className="text-xs text-gray-500">-20%</span>
                </button>
              </div>
            </div>

            {/* Paid Plans Grid */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
              {paidPlans.map((plan) => {
                const isCurrent = currentPlan.name === plan.name
                const isPopular = plan.name === 'Professional'

                const isLoading = loadingPlan === plan.name

                return (
                  <div
                    key={plan.name}
                    className={`relative p-6 bg-gray-50 rounded-[10px] border transition-all flex flex-col ${
                      isCurrent
                        ? 'border-gray-800'
                        : 'border-gray-200'
                    }`}
                  >
                    {isPopular && !isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-bl-[10px] rounded-tr-[10px]">
                          Popular
                        </div>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-bl-[10px] rounded-tr-[10px]">
                          Current
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{plan.name}</h3>
                      {plan.name === 'Enterprise' ? (
                        <p className="text-3xl font-bold text-gray-900">Custom</p>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">
                            ${billingInterval === 'monthly' ? plan.price : plan.yearlyPrice}
                          </span>
                          <span className="text-sm text-gray-500">
                            /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      )}
                      {billingInterval === 'yearly' && plan.name !== 'Enterprise' && (
                        <p className="mt-1 text-xs text-gray-600">
                          Save ${(plan.price * 12 - plan.yearlyPrice).toFixed(0)}/year
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span>
                          {plan.maxDrivers === -1 ? 'Unlimited' : `${plan.maxDrivers}`} drivers
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span>
                          {plan.maxDocumentsPerDriver === -1 ? 'Unlimited' : plan.maxDocumentsPerDriver} docs per driver
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span>
                          {plan.monthlyAICredits === -1 ? 'Unlimited' : `${plan.monthlyAICredits}`} AI credits/mo
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span>{plan.features?.sms ? 'Email + SMS' : 'Email'} reminders</span>
                      </li>
                      {plan.name === 'Professional' && (
                        <>
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <span>Priority support</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <span>Advanced analytics</span>
                          </li>
                        </>
                      )}
                      {plan.name === 'Enterprise' && (
                        <>
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <span>Dedicated support</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
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
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed hover:bg-gray-200'
                          : 'bg-gray-800 hover:bg-gray-900 text-white'
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
              })}
            </div>

            {/* Free Plan - Full Width */}
            {freePlan && (
              <div className={`p-6 bg-gray-50 rounded-[10px] border ${currentPlan.name === 'Free' ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{freePlan.name}</h3>
                      {currentPlan.name === 'Free' && (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 rounded-[10px] text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="max-w-2xl mb-5 text-sm text-gray-500">
                      Perfect for trying out Logilink. Get started with basic features at no cost.
                    </p>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="flex-shrink-0 w-4 h-4 mt-1 text-gray-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{freePlan.maxDrivers} Drivers</p>
                          <p className="text-xs text-gray-500 mt-0.5">Limited capacity</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="flex-shrink-0 w-4 h-4 mt-1 text-gray-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{freePlan.maxDocumentsPerDriver} Doc per Driver</p>
                          <p className="text-xs text-gray-500 mt-0.5">Basic tracking</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="flex-shrink-0 w-4 h-4 mt-1 text-gray-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{freePlan.initialAICredits} AI Credits</p>
                          <p className="text-xs text-gray-500 mt-0.5">One-time only</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="flex-shrink-0 w-4 h-4 mt-1 text-gray-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Email Reminders</p>
                          <p className="text-xs text-gray-500 mt-0.5">Basic alerts</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-8 text-right">
                    <p className="mb-1 text-4xl font-bold text-gray-900">$0</p>
                    <p className="mb-4 text-sm text-gray-500">Forever free</p>
                    {currentPlan.name !== 'Free' && (
                      <Button variant="outline" disabled className="opacity-50 rounded-[10px]">
                        Contact Support
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Billing History & Invoices */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Invoices & Billing History</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {billingHistoryData.length > 0 ? `${billingHistoryData.length} total transactions` : 'No transactions yet'}
                  </p>
                </div>
              </div>

              {billingHistoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 bg-gray-100 rounded-[10px] mb-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-gray-900">No invoices yet</p>
                  <p className="text-xs text-gray-500">
                    Your billing history will appear here after your first transaction
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {billingHistoryData.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-200 rounded-[10px]">
                          <FileText className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}</p>
                            <Badge className={`text-xs rounded-[6px] ${
                              invoice.status === 'PAID'
                                ? 'bg-gray-100 text-gray-800 border-gray-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {invoice.status || 'PAID'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">{formatDate(invoice.paidAt || invoice.createdAt)}</p>
                            <span className="text-xs text-gray-400">•</span>
                            {invoice.plan ? (
                              <p className="text-xs text-gray-500">{invoice.plan} Plan</p>
                            ) : (
                              <p className="text-xs text-gray-500">Credit Purchase</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-gray-900">${invoice.amount?.toFixed(2) || '0.00'}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-[10px] hover:bg-gray-200"
                          onClick={() => {
                            window.open(`/client/billing/invoice/${invoice.id}`, '_blank')
                          }}
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
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
