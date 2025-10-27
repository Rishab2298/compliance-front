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
const mapDocumentStatus = (dbStatus) => {
  const statusMap = {
    'ACTIVE': 'Verified',
    'EXPIRING_SOON': 'Expiring Soon',
    'EXPIRED': 'Expired',
    'PENDING': 'Pending',
    'PROCESSING': 'Processing',
    'REJECTED': 'Expired',
    'FAILED': 'Expired',
  }
  return statusMap[dbStatus] || 'Pending'
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
const transformDriverData = (drivers = [], documentTypes = []) => {
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
      transformed[`${docType}_status`] = doc ? mapDocumentStatus(doc.status) : 'Pending'
    })

    return transformed
  })
}

// Simplified status badge
const getStatusBadge = (status) => {
  const variants = {
    'Verified': 'bg-green-100 text-green-800',
    'Expiring Soon': 'bg-yellow-100 text-yellow-800',
    'Expired': 'bg-red-100 text-red-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-gray-100 text-gray-800',
    'Compliant': 'bg-green-100 text-green-800',
    'Warning': 'bg-yellow-100 text-yellow-800',
    'Critical': 'bg-red-100 text-red-800',
  }

  return (
    <Badge className={`${variants[status] || variants.Pending} rounded-[10px] border-0`}>
      {status}
    </Badge>
  )
}

// Compliance score badge
const getComplianceScoreBadge = (score) => {
  let bgColor, textColor, borderColor

  if (score >= 81) {
    // Green for 81-100%
    bgColor = 'bg-green-100'
    textColor = 'text-green-800'
    borderColor = 'border-green-200'
  } else if (score >= 51) {
    // Yellow for 51-80%
    bgColor = 'bg-yellow-100'
    textColor = 'text-yellow-800'
    borderColor = 'border-yellow-200'
  } else {
    // Red for 0-50%
    bgColor = 'bg-red-100'
    textColor = 'text-red-800'
    borderColor = 'border-red-200'
  }

  return (
    <Badge className={`${bgColor} ${textColor} ${borderColor} border rounded-[10px]`}>
      <span className="font-semibold">{score}%</span>
    </Badge>
  )
}

// Generate simplified columns
const generateColumns = (documentTypes = [], onDeleteClick, onViewClick) => {
  const baseColumns = [
    {
      accessorKey: "name",
      header: "Driver",
      cell: ({ row }) => {
        const initials = row.original.name.split(' ').map(n => n[0]).join('').substring(0, 2)
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-xs font-semibold text-white bg-gray-700 rounded-full w-9 h-9">
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{row.original.name}</div>
              <div className="text-xs text-gray-500">{row.original.employeeId}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-gray-700">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-sm text-gray-700">{row.original.phone}</div>
      ),
    },
    {
      accessorKey: "documentsCount",
      header: "Documents",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">{row.original.documentsCount}</div>
      ),
    },
    {
      accessorKey: "complianceScore",
      header: "Compliance",
      cell: ({ row }) => getComplianceScoreBadge(row.original.complianceScore),
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
              className="h-8 w-8 p-0 rounded-[10px]"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-[10px]">
            <DropdownMenuItem onClick={() => onViewClick && onViewClick(row.original)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => onDeleteClick && onDeleteClick(row.original)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
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

  // Transform database data for table
  const transformedData = React.useMemo(() => {
    console.log('🔄 Table: transforming data...', {
      driversCount: initialData?.length || 0,
      documentTypesCount: documentTypes?.length || 0,
    })
    const result = transformDriverData(initialData, documentTypes)
    console.log('✅ Table: transformation complete', {
      transformedCount: result?.length || 0,
      complianceScores: result?.map(d => ({ name: d.name, score: d.complianceScore }))
    })
    return result
  }, [initialData, documentTypes])

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
    generateColumns(documentTypes, handleDeleteClick, handleViewClick),
    [documentTypes]
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
      <div className="bg-white rounded-[10px] p-4 border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              placeholder="Search drivers..."
              value={(table.getColumn("name")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-10 rounded-[10px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/client/add-a-driver")}
              className="rounded-[10px]"
            >
              Add Driver
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] border border-gray-200 overflow-hidden py-4 pl-8">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="px-4 border-b border-gray-200 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs font-medium text-gray-500 uppercase">
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
                  className="px-4 border-b border-gray-200 hover:bg-gray-50"
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
                  className="h-24 text-sm text-center text-gray-500"
                >
                  No drivers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {table.getRowModel().rows.length} of {data.length} driver(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-[10px]"
          >
            Previous
          </Button>
          <div className="px-2 text-sm text-gray-900">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-[10px]"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[10px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{driverToDelete?.name}</strong>?
              This action cannot be undone. All documents and records associated with this driver will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDriverToDelete(null)} className="rounded-[10px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-[10px]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
