export type TicketStatus = 'open' | 'closed' | 'in progress';

export type Ticket = {
  id: number;
  title: string;
  date: string; // ISO or human date
  status: TicketStatus;
  description: string;
  machineCode: string;
  model: string;
  category: string;
  attachments?: { type: 'image' | 'video' | 'audio'; uri: string }[];
};

export const tickets: Ticket[] = [
  {
    id: 101,
    title: 'Machine Break down',
    date: '2025-04-16',
    status: 'open',
    description:
      'Machine stopped during operation with code E42. Loud noise before shutdown. Needs technician visit.',
    machineCode: 'MC-AX42',
    model: 'Apex X200',
    category: 'Breakdown',
    attachments: [
      { type: 'image', uri: 'https://picsum.photos/seed/101/600/400' },
    ],
  },
  {
    id: 102,
    title: 'Fault on Machine',
    date: '2025-02-24',
    status: 'closed',
    description:
      'Intermittent overheating warning. Filter replaced and firmware updated. Working fine now.',
    machineCode: 'MC-BZ77',
    model: 'Apex Z310',
    category: 'Maintenance',
  },
  {
    id: 103,
    title: 'Calibration Required',
    date: '2025-06-16',
    status: 'in progress',
    description:
      'Product measurements off by 0.5mm. Requires remote calibration session and test run.',
    machineCode: 'MC-CAL33',
    model: 'Apex Pro 5',
    category: 'Calibration',
  },
  {
    id: 104,
    title: 'Sensor Error S-14',
    date: '2025-08-06',
    status: 'in progress',
    description:
      'S-14 sensor intermittently fails to initialize after reboot. Logs attached for review.',
    machineCode: 'MC-S14',
    model: 'Apex X200',
    category: 'Electronics',
    attachments: [
      { type: 'image', uri: 'https://picsum.photos/seed/104/600/400' },
      { type: 'image', uri: 'https://picsum.photos/seed/104b/600/400' },
    ],
  },
];

export const statusColor: Record<TicketStatus, string> = {
  open: '#2ecc40',
  closed: '#222',
  'in progress': '#1e90ff',
};

export function getTicketById(id: number) {
  return tickets.find(t => t.id === id);
}
