import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// In-memory mock for now; replace with DB later
const TicketSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  status: z.enum(['open', 'closed', 'in progress']),
  description: z.string(),
  machineCode: z.string(),
  model: z.string(),
  category: z.string(),
});

type Ticket = z.infer<typeof TicketSchema>;

const mockTickets: Ticket[] = [
  {
    id: 101,
    title: 'Machine Break down',
    date: '2025-04-16',
    status: 'open',
    description: 'Machine stopped during operation with code E42.',
    machineCode: 'MC-AX42',
    model: 'Apex X200',
    category: 'Breakdown',
  },
];

// GET /api/tickets
router.get('/', (_req, res) => {
  res.json({ tickets: mockTickets });
});

// GET /api/tickets/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const ticket = mockTickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Not found' });
  res.json({ ticket });
});

// POST /api/tickets (placeholder)
router.post('/', (req, res) => {
  // Validate & insert into DB in the future
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
