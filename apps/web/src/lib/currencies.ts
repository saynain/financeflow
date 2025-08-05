export interface Currency {
  code: string
  name: string
  symbol: string
  position: 'before' | 'after'
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', position: 'before' },
  { code: 'EUR', name: 'Euro', symbol: '€', position: 'before' },
  { code: 'GBP', name: 'British Pound', symbol: '£', position: 'before' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', position: 'before' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', position: 'before' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', position: 'before' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', position: 'before' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', position: 'before' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', position: 'after' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', position: 'after' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', position: 'after' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', position: 'after' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', position: 'after' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', position: 'after' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', position: 'before' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', position: 'before' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', position: 'before' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', position: 'before' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', position: 'before' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', position: 'before' },
]

export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code)
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount} ${currency.symbol}`
  }
}

export function parseCurrencyAmount(value: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
} 