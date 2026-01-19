import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  User, 
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore, Ticket } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TicketStatus = 'new' | 'assigned' | 'in-progress' | 'completed' | 'declined';

const statusConfig: Record<TicketStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: 'New', color: 'text-primary', bgColor: 'bg-primary/10', icon: Clock },
  assigned: { label: 'Assigned', color: 'text-accent-foreground', bgColor: 'bg-accent', icon: User },
  'in-progress': { label: 'In Progress', color: 'text-warning', bgColor: 'bg-warning/10', icon: ArrowRight },
  completed: { label: 'Completed', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-primary/10 text-primary' },
  high: { label: 'High', color: 'bg-warning/10 text-warning' },
  urgent: { label: 'Urgent', color: 'bg-destructive/10 text-destructive' },
};

export default function Tickets() {
  const { tickets, technicians, assignTicket, updateTicket } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TicketStatus | 'all'>('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || ticket.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const ticketCounts: Record<TicketStatus | 'all', number> = {
    all: tickets.length,
    new: tickets.filter((t) => t.status === 'new').length,
    assigned: tickets.filter((t) => t.status === 'assigned').length,
    'in-progress': tickets.filter((t) => t.status === 'in-progress').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
    declined: tickets.filter((t) => t.status === 'declined').length,
  };

  const handleAssign = () => {
    if (selectedTicket && selectedTechnician) {
      assignTicket(selectedTicket.id, selectedTechnician);
      setAssignDialogOpen(false);
      setSelectedTicket(null);
      setSelectedTechnician('');
      toast({
        title: 'Ticket assigned',
        description: 'The ticket has been assigned successfully.',
      });
    }
  };

  const openAssignDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignDialogOpen(true);
  };

  const availableTechnicians = technicians.filter((t) => t.status === 'online' && t.role === 'technician');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and assign service tickets</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketStatus | 'all')} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All ({ticketCounts.all})
                </TabsTrigger>
                <TabsTrigger value="new" className="text-xs sm:text-sm">
                  New ({ticketCounts.new})
                </TabsTrigger>
                <TabsTrigger value="assigned" className="text-xs sm:text-sm">
                  Assigned ({ticketCounts.assigned})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
                  In Progress ({ticketCounts['in-progress']})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm">
                  Completed ({ticketCounts.completed})
                </TabsTrigger>
                <TabsTrigger value="declined" className="text-xs sm:text-sm relative">
                  Declined ({ticketCounts.declined})
                  {ticketCounts.declined > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No tickets found
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAssign={() => openAssignDialog(ticket)}
                  onStatusChange={(status) => {
                    updateTicket(ticket.id, { status });
                    toast({
                      title: 'Status updated',
                      description: `Ticket ${ticket.id} is now ${status}`,
                    });
                  }}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select a technician to assign {selectedTicket?.id} - {selectedTicket?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                {availableTechnicians.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No technicians available
                  </SelectItem>
                ) : (
                  availableTechnicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-success rounded-full" />
                        <span>{tech.name}</span>
                        <span className="text-muted-foreground">({tech.activeJobs} jobs)</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedTechnician}>
              Assign Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketCard({
  ticket,
  onAssign,
  onStatusChange,
}: {
  ticket: Ticket;
  onAssign: () => void;
  onStatusChange: (status: TicketStatus) => void;
}) {
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const isDeclined = ticket.status === 'declined';

  return (
    <div
      className={cn(
        'border rounded-lg p-4 hover:shadow-card-hover transition-all',
        isDeclined && 'border-destructive/50 bg-destructive/5'
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg flex-shrink-0', status.bgColor)}>
              <status.icon className={cn('h-4 w-4', status.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
                <Badge className={cn('text-xs', priority.color)} variant="secondary">
                  {priority.label}
                </Badge>
                {ticket.priority === 'urgent' && (
                  <AlertTriangle className="h-4 w-4 text-destructive animate-pulse-soft" />
                )}
              </div>
              <h3 className="font-semibold text-foreground mt-1">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{ticket.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{ticket.customerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimeAgo(ticket.createdAt)}</span>
            </div>
          </div>

          {ticket.assigneeName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Assigned to:</span>
              <Badge variant="outline">{ticket.assigneeName}</Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {ticket.status === 'new' && (
            <Button onClick={onAssign} size="sm" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Assign
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ticket.status !== 'in-progress' && ticket.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange('in-progress')}>
                  Mark In Progress
                </DropdownMenuItem>
              )}
              {ticket.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                  Mark Completed
                </DropdownMenuItem>
              )}
              {ticket.status !== 'declined' && (
                <DropdownMenuItem 
                  onClick={() => onStatusChange('declined')}
                  className="text-destructive focus:text-destructive"
                >
                  Mark Declined
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
