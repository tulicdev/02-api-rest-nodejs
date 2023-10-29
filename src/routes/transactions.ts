import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

const _TRANSACTIONS = 'transactions'
const _ID_FIELD = 'id'
const _AMOUNT_FIELD = 'amount'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex(_TRANSACTIONS).select()

    return {
      transactions,
    }
  })

  app.get('/:id', async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionsParamsSchema.parse(request.params)

    const transaction = await knex(_TRANSACTIONS).where(_ID_FIELD, id).first()

    return {
      transaction,
    }
  })

  app.get('/summary', async () => {
    const summary = await knex(_TRANSACTIONS)
      .sum(_AMOUNT_FIELD, { as: _AMOUNT_FIELD })
      .first()

    return {
      summary,
    }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex(_TRANSACTIONS).insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })
}
