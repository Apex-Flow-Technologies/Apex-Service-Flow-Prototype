import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Ticket, User } from '@/store';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface ChartsProps {
  tickets: Ticket[];
  technicians: User[];
}

export function TicketTrendChart({ tickets }: { tickets: Ticket[] }) {
  // Generate last 7 days of data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const count = tickets.filter(t => isSameDay(new Date(t.createdAt), date)).length;
    const completed = tickets.filter(t => t.status === 'completed' && isSameDay(new Date(t.updatedAt), date)).length;
    
    return {
      name: format(date, 'MMM dd'),
      created: count,
      resolved: completed,
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="created" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorCreated)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="resolved" 
            stroke="hsl(var(--success))" 
            fillOpacity={1} 
            fill="url(#colorResolved)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonutChart({ tickets }: { tickets: Ticket[] }) {
  const data = [
    { name: 'New', value: tickets.filter(t => t.status === 'new').length, color: 'hsl(var(--primary))' },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Completed', value: tickets.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'Declined', value: tickets.filter(t => t.status === 'declined').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px'
            }} 
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TechnicianPerformanceChart({ technicians, tickets }: { technicians: User[], tickets: Ticket[] }) {
  const data = technicians.slice(0, 5).map(tech => ({
    name: tech.name.split(' ')[0],
    completed: tickets.filter(t => (t.assignedToId === tech.id || t.assignedToId === tech.username) && t.status === 'completed').length,
    active: tickets.filter(t => (t.assignedToId === tech.id || t.assignedToId === tech.username) && (t.status === 'assigned' || t.status === 'in-progress')).length
  }));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip 
             contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px'
            }} 
          />
          <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="active" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
