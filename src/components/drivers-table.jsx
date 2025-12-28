import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, MoreVertical, Trash2, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/ThemeContext"
import { getThemeClasses } from "@/utils/themeClasses"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNavigate } from "react-router-dom"

// Map database document status to UI status
const mapDocumentStatus = (dbStatus, t) => {
  const statusMap = {
    'ACTIVE': t('drivers.table.status.verified'),
    'EXPIRING_SOON': t('drivers.table.status.expiringSoon'),
    'EXPIRED': t('drivers.table.status.expired'),
    'PENDING': t('drivers.table.status.pending'),
    'PROCESSING': t('drivers.table.status.processing'),
    'REJECTED': t('drivers.table.status.expired'),
    'FAILED': t('drivers.table.status.expired'),
  }
  return statusMap[dbStatus] || t('drivers.table.status.pending')
}

// Calculate compliance score as percentage
const calculateComplianceScore = (documents = [], documentTypes = []) => {
  // If no document types configured, return 0
  if (!documentTypes || documentTypes.length === 0) return 0

  // If no documents uploaded, return 0
  if (!documents || documents.length === 0) return 0

  // Count how many required document types have at least one ACTIVE document
  const verifiedDocumentTypes = documentTypes.filter(docType => {
    const hasActive = documents.some(doc =>
      doc.type === docType && doc.status === 'ACTIVE'
    )
    return hasActive
  })

  // Calculate percentage
  const score = (verifiedDocumentTypes.length / documentTypes.length) * 100

  // Log for debugging (can be removed later)
  if (documents.length > 0) {
    console.log(`🔍 Table compliance calc: ${verifiedDocumentTypes.length}/${documentTypes.length} = ${Math.round(score)}%`, {
      documents: documents.map(d => ({ type: d.type, status: d.status })),
      requiredTypes: documentTypes
    })
  }

  return Math.round(score)
}

// Transform database driver data for table
const transformDriverData = (drivers = [], documentTypes = [], t) => {
  return drivers.map(driver => {
    const transformed = {
      id: driver.id,
      name: driver.name,
      employeeId: driver.contact || 'N/A',
      email: driver.email || 'N/A',
      phone: driver.phone || 'N/A',
      documents: driver.documents || [],
      complianceScore: calculateComplianceScore(driver.documents, documentTypes),
      documentsCount: driver.documents?.length || 0,
    }

    // Add document columns dynamically
    documentTypes.forEach(docType => {
      const doc = driver.documents?.find(d => d.type === docType)
      transformed[`${docType}_status`] = doc ? mapDocumentStatus(doc.status, t) : t('drivers.table.status.pending')
    })

    return transformed
  })
}

// Simplified status badge with dark mode support
const getStatusBadge = (status, isDarkMode = false) => {
  const lightVariants = {
    'Verified': 'bg-green-100 text-green-800 border-green-200',
    'Expiring Soon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Expired': 'bg-red-100 text-red-800 border-red-200',
    'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pending': 'bg-gray-100 text-gray-800 border-gray-200',
    'Compliant': 'bg-green-100 text-green-800 border-green-200',
    'Warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Critical': 'bg-red-100 text-red-800 border-red-200',
  }

  const darkVariants = {
    'Verified': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Expiring Soon': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Expired': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Processing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Pending': 'bg-slate-700 text-slate-300 border-slate-600',
    'Compliant': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Warning': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const variants = isDarkMode ? darkVariants : lightVariants

  return (
    <Badge className={`${variants[status] || variants.Pending} rounded-[10px] border`}>
      {status}
    </Badge>
  )
}

// Compliance score badge with dark mode support
const getComplianceScoreBadge = (score, isDarkMode = false) => {
  let lightClasses, darkClasses

  if (score >= 81) {
    // Green for 81-100%
    lightClasses = 'bg-green-100 text-green-800 border-green-200'
    darkClasses = 'bg-green-500/20 text-green-400 border-green-500/30'
  } else if (score >= 51) {
    // Yellow for 51-80%
    lightClasses = 'bg-yellow-100 text-yellow-800 border-yellow-200'
    darkClasses = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  } else {
    // Red for 0-50%
    lightClasses = 'bg-red-100 text-red-800 border-red-200'
    darkClasses = 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const classes = isDarkMode ? darkClasses : lightClasses

  return (
    <Badge className={`${classes} border rounded-[10px]`}>
      <span className="font-semibold">{score}%</span>
    </Badge>
  )
}

// Generate simplified columns with dark mode support
const generateColumns = (documentTypes = [], onDeleteClick, onViewClick, isDarkMode = false, t) => {
  const baseColumns = [
    {
      accessorKey: "name",
      header: t('drivers.table.columns.employee'),
      cell: ({ row }) => {
        const initials = row.original.name.split(' ').map(n => n[0]).join('').substring(0, 2)
        return (
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center text-xs font-semibold rounded-full w-9 h-9 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-white' : 'bg-gray-700 text-white'}`}>
              {initials}
            </div>
            <div>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.original.name}</div>
              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{row.original.employeeId}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: t('drivers.table.columns.email'),
      cell: ({ row }) => (
        <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{row.original.email}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: t('drivers.table.columns.phone'),
      cell: ({ row }) => (
        <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{row.original.phone}</div>
      ),
    },
    {
      accessorKey: "documentsCount",
      header: t('drivers.table.columns.documents'),
      cell: ({ row }) => (
        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.original.documentsCount}</div>
      ),
    },
    {
      accessorKey: "complianceScore",
      header: t('drivers.table.columns.compliance'),
      cell: ({ row }) => getComplianceScoreBadge(row.original.complianceScore, isDarkMode),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 rounded-[10px] ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">{t('drivers.table.actions.openMenu')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-40 rounded-[10px] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <DropdownMenuItem
              onClick={() => onViewClick && onViewClick(row.original)}
              className={isDarkMode ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('drivers.table.actions.viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className={isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} />
            <DropdownMenuItem
              className={isDarkMode ? 'text-red-400 focus:text-red-400 focus:bg-red-500/10' : 'text-red-600 focus:text-red-600 focus:bg-red-50'}
              onClick={() => onDeleteClick && onDeleteClick(row.original)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('drivers.table.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return baseColumns
}

export function DataTable({ data: initialData, documentTypes = [], onDeleteDriver }) {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  // Transform database data for table
  const transformedData = React.useMemo(() => {
    console.log('🔄 Table: transforming data...', {
      driversCount: initialData?.length || 0,
      documentTypesCount: documentTypes?.length || 0,
    })
    const result = transformDriverData(initialData, documentTypes, t)
    console.log('✅ Table: transformation complete', {
      transformedCount: result?.length || 0,
      complianceScores: result?.map(d => ({ name: d.name, score: d.complianceScore }))
    })
    return result
  }, [initialData, documentTypes, t])

  const [data, setData] = React.useState(transformedData)
  const [columnFilters, setColumnFilters] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [driverToDelete, setDriverToDelete] = React.useState(null)

  // Update data when initialData changes
  React.useEffect(() => {
    console.log('📊 Table: updating local state with transformed data')
    setData(transformedData)
  }, [transformedData])

  // Handle delete click
  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver)
    setDeleteDialogOpen(true)
  }

  // Handle view click
  const handleViewClick = (driver) => {
    navigate(`/client/driver/${driver.id}`)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    if (driverToDelete && onDeleteDriver) {
      onDeleteDriver(driverToDelete.id, driverToDelete.name)
    }
    setDeleteDialogOpen(false)
    setDriverToDelete(null)
  }

  // Generate columns
  const columns = React.useMemo(() =>
    generateColumns(documentTypes, handleDeleteClick, handleViewClick, isDarkMode, t),
    [documentTypes, isDarkMode, t]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="container w-full px-6 mx-auto space-y-6">
      {/* Toolbar */}
      <div className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            <Input
              placeholder={t('drivers.table.searchPlaceholder')}
              value={(table.getColumn("name")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className={`pl-10 rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/client/add-a-driver")}
              className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
            >
              {t('drivers.table.addEmployee')}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-[10px] border overflow-hidden py-4 pl-8 ${getThemeClasses.bg.card(isDarkMode)}`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={`px-4 border-b hover:bg-transparent ${getThemeClasses.border.primary(isDarkMode)}`}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={`text-xs font-medium uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`px-4 border-b ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/30' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className={`h-24 text-sm text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {t('drivers.table.noEmployees')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
          {t('drivers.table.pagination.showing')} {table.getRowModel().rows.length} {t('drivers.table.pagination.of')} {data.length} {t('drivers.table.pagination.employees')}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
          >
            {t('drivers.table.pagination.previous')}
          </Button>
          <div className={`px-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('drivers.table.pagination.page')} {table.getState().pagination.pageIndex + 1} {t('drivers.table.pagination.of')}{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
          >
            {t('drivers.table.pagination.next')}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`rounded-[10px] ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('drivers.table.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              {t('drivers.table.deleteDialog.description')} <strong className={isDarkMode ? 'text-red-400' : 'text-red-600'}>{driverToDelete?.name}</strong>?{' '}
              {t('drivers.table.deleteDialog.descriptionSuffix')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDriverToDelete(null)}
              className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
            >
              {t('drivers.table.deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className={`rounded-[10px] ${isDarkMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'} focus:ring-red-600`}
            >
              {t('drivers.table.deleteDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
