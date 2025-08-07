import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@financeflow/database'
import { getTagColor } from '@/lib/tag-colors'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transactions } = body

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 })
    }

    const results = {
      created: 0,
      errors: [] as string[],
    }

    // Process transactions in batches to avoid overwhelming the database
    const batchSize = 10
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (transaction, index) => {
          try {
            const { amount, currency, type, description, date, tags } = transaction

            // Validate required fields
            if (!amount || !type || !description || !date) {
              results.errors.push(`Transaction ${i + index + 1}: Missing required fields`)
              return
            }

            // Process tags - create new ones if they don't exist
            const processedTags: string[] = []
            if (tags && Array.isArray(tags)) {
              for (const tagName of tags) {
                if (typeof tagName === 'string' && tagName.trim()) {
                  const trimmedName = tagName.trim()
                  
                  // Check if tag exists, create if it doesn't
                  let tag = await prisma.tag.findUnique({
                    where: {
                      name_userId: {
                        name: trimmedName,
                        userId: session.user.id,
                      },
                    },
                  })

                  if (!tag) {
                    // Generate a color for the new tag
                    const color = getTagColor(trimmedName)
                    
                    tag = await prisma.tag.create({
                      data: {
                        name: trimmedName,
                        color,
                        userId: session.user.id,
                      },
                    })
                  }

                  processedTags.push(tag.name)
                }
              }
            }

            // Create the transaction
            await prisma.transaction.create({
              data: {
                amount: parseFloat(amount),
                currency: currency || 'USD',
                type,
                description,
                date: new Date(date),
                tags: processedTags,
                userId: session.user.id,
              },
            })

            results.created++
          } catch (error) {
            console.error(`Error creating transaction ${i + index + 1}:`, error)
            results.errors.push(`Transaction ${i + index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      created: results.created,
      errors: results.errors,
      total: transactions.length,
    })
  } catch (error) {
    console.error('Bulk transaction import error:', error)
    return NextResponse.json(
      { error: 'Failed to import transactions' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transactionIds } = body

    if (!Array.isArray(transactionIds)) {
      return NextResponse.json({ error: 'Invalid transaction IDs' }, { status: 400 })
    }

    // Delete transactions in batches
    const batchSize = 50
    let deletedCount = 0
    const errors: string[] = []

    for (let i = 0; i < transactionIds.length; i += batchSize) {
      const batch = transactionIds.slice(i, i + batchSize)
      
      try {
        const result = await prisma.transaction.deleteMany({
          where: {
            id: { in: batch },
            userId: session.user.id, // Ensure user can only delete their own transactions
          },
        })
        deletedCount += result.count
      } catch (error) {
        console.error(`Error deleting batch ${i / batchSize + 1}:`, error)
        errors.push(`Failed to delete batch ${i / batchSize + 1}`)
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      errors,
      total: transactionIds.length,
    })
  } catch (error) {
    console.error('Bulk transaction deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transactions' },
      { status: 500 }
    )
  }
} 