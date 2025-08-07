# CSV Import Feature

The CSV import feature allows you to bulk import transactions from a CSV file. This is useful for importing transaction data from your bank, credit card statements, or other financial applications.

## How to Use

1. **Navigate to Transactions**: Go to the Transactions page in your FinanceFlow app
2. **Click Import CSV**: Click the "Import CSV" button in the top right corner
3. **Upload File**: Drag and drop your CSV file or click to browse and select it
4. **Review & Edit**: Review the imported transactions and make any necessary edits
5. **Import**: Click "Import Transactions" to save them to your account

## CSV Format

Your CSV file should have the following columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Amount | Yes | Transaction amount (positive number) | `25.50` |
| Description | Yes | Transaction description | `Grocery shopping` |
| Date | Yes | Transaction date (YYYY-MM-DD) | `2024-01-15` |
| Type | No | Transaction type (INCOME/EXPENSE) | `EXPENSE` |
| Currency | No | Currency code (defaults to your settings) | `USD` |
| Tags | No | Comma-separated tags | `"groceries, food"` |

## Sample CSV File

You can download a sample CSV file from the import dialog to see the expected format:

```csv
Amount,Description,Date,Type,Currency,Tags
25.50,Grocery shopping,2024-01-15,EXPENSE,USD,"groceries, food"
1200.00,Salary deposit,2024-01-15,INCOME,USD,"salary, income"
45.00,Gas station,2024-01-16,EXPENSE,USD,"transport, fuel"
```

## Features

- **Smart Column Detection**: The import will automatically detect common column names like "Amount", "Description", "Date", etc.
- **Multi-Currency Support**: Detects currency from CSV or defaults to your account settings
- **Preview & Edit**: Review all transactions before importing and make changes to amounts, descriptions, dates, types, currencies, and tags
- **Tag Management**: Add or remove tags for each transaction during the import process
- **Error Handling**: Invalid rows are skipped and you'll see warnings for any issues
- **Batch Processing**: Large files are processed in batches to ensure reliability

## Tips

- **Date Format**: Use YYYY-MM-DD format for dates (e.g., `2024-01-15`)
- **Amounts**: Use positive numbers for amounts (the system will handle income vs expense based on the Type column)
- **Tags**: Enclose tags in quotes if they contain commas: `"tag1, tag2"`
- **Headers**: Include a header row with column names for better detection
- **Currency**: Transactions will use the currency from your CSV file, or default to your account settings

## Troubleshooting

- **Invalid Amount**: Make sure amounts are valid numbers
- **Invalid Date**: Use YYYY-MM-DD format for dates
- **Missing Data**: Required fields (Amount, Description, Date) must be present
- **Large Files**: For very large files, consider splitting them into smaller chunks

## Supported File Types

- CSV files (.csv)
- Text files with comma-separated values
- Files exported from Excel, Google Sheets, or other spreadsheet applications 