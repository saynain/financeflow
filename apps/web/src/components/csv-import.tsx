'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagInput } from '@/components/tag-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Icons } from '@/components/ui/icons'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface CSVTransaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: string
  tags: string[]
  currency: string
  originalRow: number
}

interface CSVImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CSVImport({ open, onOpenChange }: CSVImportProps) {
  const [csvData, setCsvData] = useState<CSVTransaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [userCurrency, setUserCurrency] = useState<string>('USD')
  const queryClient = useQueryClient()

  // Fetch user currency on component mount
  useEffect(() => {
    fetch('/api/user/currency')
      .then(res => res.json())
      .then(data => {
        const currency = data.currency || 'USD'
        setUserCurrency(currency)
      })
      .catch(error => {
        console.error('Error fetching currency:', error)
        setUserCurrency('USD')
      })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    setErrors([])

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n')
        
        // Detect delimiter (comma or semicolon)
        const firstLine = lines[0] || ''
        const hasSemicolon = firstLine.includes(';')
        const delimiter = hasSemicolon ? ';' : ','
        
        const headers = lines[0]?.split(delimiter).map(h => h.trim().toLowerCase()) || []
        
        const transactions: CSVTransaction[] = []
        const newErrors: string[] = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = parseCSVLine(line, delimiter)
          if (values.length < 3) {
            newErrors.push(`Row ${i + 1}: Insufficient data`)
            continue
          }

          // Try to map CSV columns to transaction fields
          const amountIndex = headers.findIndex(h => 
            h.includes('amount') || h.includes('value') || h.includes('sum') || h.includes('beløp')
          )
          const descriptionIndex = headers.findIndex(h => 
            h.includes('description') || h.includes('note') || h.includes('memo') || h.includes('text') || h.includes('tekst')
          )
          const dateIndex = headers.findIndex(h => 
            h.includes('date') || h.includes('time') || h.includes('dato')
          )
          const typeIndex = headers.findIndex(h => 
            h.includes('type') || h.includes('category') || h.includes('kategori')
          )
          const currencyIndex = headers.findIndex(h => 
            h.includes('currency') || h.includes('valuta') || h.includes('original valuta')
          )
          
          // Norwegian bank specific mappings
          const originalAmountIndex = headers.findIndex(h => 
            h.includes('originalt beløp')
          )
          const hovedkategoriIndex = headers.findIndex(h => 
            h.includes('hovedkategori')
          )
          const underkategoriIndex = headers.findIndex(h => 
            h.includes('underkategori')
          )

          // If we can't find specific headers, use first few columns
          const amount = amountIndex >= 0 ? values[amountIndex] : values[0]
          const description = descriptionIndex >= 0 ? values[descriptionIndex] : values[1]
          const date = dateIndex >= 0 ? values[dateIndex] : values[2]
          const type = typeIndex >= 0 ? values[typeIndex] : 'EXPENSE'
          const currency = currencyIndex >= 0 ? values[currencyIndex] : userCurrency
          

          
          // Handle Norwegian bank format
          let finalAmount = amount
          let finalDescription = description
          let finalCurrency = currency
          
          // Use original amount if available (for foreign currency transactions)
          if (originalAmountIndex >= 0 && values[originalAmountIndex]) {
            finalAmount = values[originalAmountIndex]
          }
          
          // Combine categories for description if available
          if (hovedkategoriIndex >= 0 && underkategoriIndex >= 0) {
            const hovedkategori = values[hovedkategoriIndex]
            const underkategori = values[underkategoriIndex]
            if (hovedkategori && underkategori) {
              finalDescription = `${description} (${hovedkategori} - ${underkategori})`
            } else if (hovedkategori) {
              finalDescription = `${description} (${hovedkategori})`
            }
          }
          
          // Validate and normalize currency
          const validCurrencies = ['USD', 'EUR', 'GBP', 'NOK', 'SEK', 'DKK', 'CAD', 'AUD', 'CHF', 'JPY']
          if (finalCurrency && !validCurrencies.includes(finalCurrency.toUpperCase())) {
            console.warn(`Invalid currency "${finalCurrency}" for row ${i + 1}, using default`)
            finalCurrency = userCurrency || 'USD'
          } else if (finalCurrency) {
            finalCurrency = finalCurrency.toUpperCase()
          }

          // Parse amount
          const amountValue = parseFloat(finalAmount?.replace(/[^\d.-]/g, '') || '0')
          if (isNaN(amountValue)) {
            newErrors.push(`Row ${i + 1}: Invalid amount "${finalAmount}"`)
            continue
          }

          // Parse date
          let parsedDate = new Date()
          try {
            parsedDate = new Date(date || new Date())
            if (isNaN(parsedDate.getTime())) {
              parsedDate = new Date()
            }
          } catch {
            newErrors.push(`Row ${i + 1}: Invalid date "${date}"`)
            continue
          }

          // Determine transaction type
          let transactionType: 'INCOME' | 'EXPENSE' = 'EXPENSE'
          if (typeIndex >= 0) {
            const typeValue = type?.toLowerCase() || ''
            if (typeValue.includes('income') || typeValue.includes('credit') || typeValue.includes('deposit')) {
              transactionType = 'INCOME'
            } else if (typeValue.includes('expense') || typeValue.includes('debit') || typeValue.includes('withdrawal')) {
              transactionType = 'EXPENSE'
            }
          }

          transactions.push({
            id: `temp-${i}`,
            amount: Math.abs(amountValue),
            type: transactionType,
            description: finalDescription || 'Imported transaction',
            date: format(parsedDate, 'yyyy-MM-dd'),
            tags: [],
            currency: finalCurrency || userCurrency || 'USD',
            originalRow: i + 1,
          })
        }

        setCsvData(transactions)
        setErrors(newErrors)
      } catch (error) {
        setErrors(['Failed to parse CSV file'])
      } finally {
        setIsProcessing(false)
      }
    }

    reader.readAsText(file)
  }, [userCurrency])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  })

  const updateTransaction = (id: string, field: keyof CSVTransaction, value: any) => {
    setCsvData(prev => 
      prev.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    )
  }

  const removeTransaction = (id: string) => {
    setCsvData(prev => prev.filter(t => t.id !== id))
  }

  const importMutation = useMutation({
    mutationFn: async (transactions: CSVTransaction[]) => {
      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import transactions')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setCsvData([])
      setErrors([])
      onOpenChange(false)
      
      // Show success message
      if (data.errors && data.errors.length > 0) {
        toast.success(`Imported ${data.created} transactions successfully`, {
          description: `${data.errors.length} transactions had errors and were skipped.`
        })
      } else {
        toast.success(`Successfully imported ${data.created} transactions`)
      }
    },
    onError: (error) => {
      console.error('Import error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to import transactions'
      setErrors([errorMessage])
      toast.error(errorMessage)
    },
  })

  const handleImport = async () => {
    if (csvData.length === 0) return
    
    setImporting(true)
    try {
      await importMutation.mutateAsync(csvData)
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }

  const clearAll = () => {
    setCsvData([])
    setErrors([])
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Import Transactions from CSV</h2>
              <p className="text-muted-foreground mt-1">
                Upload a CSV file to import your transactions
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {csvData.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your CSV file here' : 'Upload CSV file'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop a CSV file, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Expected columns: Amount, Description, Date (optional: Type, Currency, Tags)
              </p>
              <div className="mt-4 space-y-2">
                <a 
                  href="/sample-transactions.csv" 
                  download
                  className="text-sm text-blue-600 hover:text-blue-800 underline block"
                >
                  Download standard CSV sample
                </a>
                <a 
                  href="/sample-norwegian-bank.csv" 
                  download
                  className="text-sm text-blue-600 hover:text-blue-800 underline block"
                >
                  Download Norwegian bank CSV sample
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Preview Transactions ({csvData.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review and edit your transactions before importing
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearAll}>
                    Clear All
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={importing || csvData.length === 0}
                  >
                    {importing && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Import {csvData.length} Transaction{csvData.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Import Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Transactions List */}
              <div className="space-y-4">
                {csvData.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.type === 'INCOME' ? 'default' : 'secondary'}>
                            {transaction.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Row {transaction.originalRow}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTransaction(transaction.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={transaction.amount}
                            onChange={(e) => updateTransaction(transaction.id, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        {/* Type */}
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={transaction.type}
                            onValueChange={(value: 'INCOME' | 'EXPENSE') => 
                              updateTransaction(transaction.id, 'type', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EXPENSE">Expense</SelectItem>
                              <SelectItem value="INCOME">Income</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <Label>Description</Label>
                          <Input
                            value={transaction.description}
                            onChange={(e) => updateTransaction(transaction.id, 'description', e.target.value)}
                            placeholder="Transaction description"
                          />
                        </div>

                        {/* Date */}
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={transaction.date}
                            onChange={(e) => updateTransaction(transaction.id, 'date', e.target.value)}
                          />
                        </div>

                        {/* Currency */}
                        <div>
                          <Label>Currency</Label>
                          <Select
                            value={transaction.currency}
                            onValueChange={(value) => updateTransaction(transaction.id, 'currency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="NOK">NOK</SelectItem>
                              <SelectItem value="SEK">SEK</SelectItem>
                              <SelectItem value="DKK">DKK</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="AUD">AUD</SelectItem>
                              <SelectItem value="CHF">CHF</SelectItem>
                              <SelectItem value="JPY">JPY</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tags */}
                        <div className="md:col-span-2">
                          <Label>Tags</Label>
                          <TagInput
                            value={transaction.tags}
                            onChange={(tags) => updateTransaction(transaction.id, 'tags', tags)}
                            placeholder="Add tags..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to parse CSV lines properly (handles quoted values)
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
} 