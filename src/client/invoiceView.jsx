import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const InvoiceView = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  // Fetch invoice details and company info
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const token = await getToken()

      // Fetch billing history
      const billingResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/billing/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!billingResponse.ok) {
        throw new Error('Failed to fetch invoice')
      }

      const billingResult = await billingResponse.json()
      const invoice = billingResult.data.find(inv => inv.id === invoiceId)

      if (!invoice) {
        return { invoice: null, company: null }
      }

      // Fetch company details - optional, don't fail if this errors
      let company = null
      try {
        const companyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/billing/current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (companyResponse.ok) {
          const companyResult = await companyResponse.json()
          console.log('📦 Full API Response:', companyResult)
          console.log('📦 Company Data:', companyResult.data.company)
          company = companyResult.data.company
        } else {
          console.error('Failed to fetch company:', companyResponse.status, companyResponse.statusText)
        }
      } catch (error) {
        console.warn('Failed to fetch company details:', error)
        // Continue without company details
      }

      console.log('🏢 Final company object:', company)

      return {
        invoice,
        company,
      }
    },
  })

  const invoice = invoiceData?.invoice
  const company = invoiceData?.company

  // Debug logging
  console.log('🔍 Invoice View - Company:', company)
  console.log('🔍 Invoice View - Invoice:', invoice)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDownload = () => {
    // Generate filename with invoice number and date
    const invoiceNum = invoice?.invoiceNumber || `INV-${invoice?.id?.slice(0, 8)}`
    const date = invoice?.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : 'unknown'
    const filename = `${invoiceNum}_${date}.pdf`

    // Use browser's print to PDF functionality
    const printWindow = window.open('', '_blank')
    const invoiceContent = document.querySelector('.invoice-content')

    if (printWindow && invoiceContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${invoiceNum}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; }
              ${Array.from(document.styleSheets).map(sheet => {
                try {
                  return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')
                } catch (e) {
                  return ''
                }
              }).join('\n')}
            </style>
          </head>
          <body>
            ${invoiceContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()

      // Small delay to ensure styles load
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    } else {
      // Fallback to regular print
      window.print()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <Skeleton className="h-6 w-32 rounded-[10px]" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-[10px]" />
              <Skeleton className="h-10 w-24 rounded-[10px]" />
            </div>
          </div>
        </header>
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto max-w-4xl">
            <section className="bg-white rounded-[10px] p-8 border border-gray-200">
              <Skeleton className="h-12 w-48 mb-8 rounded-[10px]" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full rounded-[10px]" />
                <Skeleton className="h-6 w-3/4 rounded-[10px]" />
                <Skeleton className="h-6 w-5/6 rounded-[10px]" />
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Invoice Not Found</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/client/billing')}
              className="rounded-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Billing
            </Button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-2">Invoice not found</p>
            <p className="text-sm text-gray-500">The invoice you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header - Hide when printing */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0 print:hidden">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Invoice Details</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/client/billing')}
              className="rounded-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="rounded-[10px]"
            >
              Print
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-gray-800 hover:bg-gray-900 text-white rounded-[10px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      {/* Invoice Content */}
      <div className="flex-1 py-8 print:py-0">
        <div className="container w-full px-6 mx-auto max-w-4xl print:max-w-none">
          <section className="invoice-content bg-white rounded-[10px] p-8 border border-gray-200 print:border-0 print:rounded-none print:p-12">
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-200">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
                </p>
              </div>
              <div className="text-right">
                {invoice.status && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'PAID'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {invoice.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                    {invoice.status}
                  </span>
                )}
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="text-sm text-gray-900">{formatDate(invoice.createdAt)}</p>
                </div>
                {invoice.paidAt && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Paid Date</p>
                    <p className="text-sm text-gray-900">{formatDate(invoice.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Billed From and Billed To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Billed From</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">Logilink Solutions</p>
                  <p className="text-sm text-gray-600">support@logilink.com</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Billed To</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{company?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{company?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{company?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">Description</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.plan ? `${invoice.plan} Plan Subscription` : 'AI Credits Purchase'}
                      </p>
                      {invoice.plan ? (
                        // For plan subscriptions, show billing period with month/annual indicator
                        <p className="text-xs text-gray-500 mt-1">
                          {invoice.billingPeriodStart && invoice.billingPeriodEnd ? (
                            <>
                              Billing Period (
                              {(() => {
                                const start = new Date(invoice.billingPeriodStart)
                                const end = new Date(invoice.billingPeriodEnd)
                                const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
                                return diffDays > 335 ? 'Annual' : 'Monthly'
                              })()}
                              ): {formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}
                            </>
                          ) : (
                            'Monthly subscription'
                          )}
                        </p>
                      ) : (
                        // For credit purchases, show lifetime validity
                        <p className="text-xs text-gray-500 mt-1">
                          Valid for lifetime • Credits never expire
                        </p>
                      )}
                      {invoice.stripeInvoiceId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Transaction ID: {invoice.stripeInvoiceId}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <p className="text-sm font-medium text-gray-900">${invoice.amount?.toFixed(2) || '0.00'}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Amount Summary */}
            <div className="bg-gray-50 rounded-[10px] p-6 border border-gray-200 print:bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Payment Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${invoice.amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                    <span className="text-2xl font-bold text-gray-900">${invoice.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Thank you for your business with Logilink Solutions. If you have any questions about this invoice,
                please contact us at support@logilink.com or call +1 (555) 123-4567
              </p>
              <p className="text-xs text-gray-400 text-center mt-2">
                Logilink Solutions - Simplifying Driver Document Management
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
