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
  MoreHorizontal,
  Play,
  Pause,
  FileAudio,
  Image as ImageIcon,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// --- Configuration ---

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

// --- Helper Functions ---

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// --- Components ---

export default function Tickets() {
  const { tickets, technicians, assignTicket, updateTicket } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TicketStatus | 'all'>('all');
  
  // Dialog States
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Selection States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  // Filter Logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || ticket.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Counts Logic
  const ticketCounts: Record<TicketStatus | 'all', number> = {
    all: tickets.length,
    new: tickets.filter((t) => t.status === 'new').length,
    assigned: tickets.filter((t) => t.status === 'assigned').length,
    'in-progress': tickets.filter((t) => t.status === 'in-progress').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
    declined: tickets.filter((t) => t.status === 'declined').length,
  };

  // Handlers
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

  const openAssignDialog = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation(); // Prevent opening details when clicking assign
    setSelectedTicket(ticket);
    setAssignDialogOpen(true);
  };

  const openDetailsDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsDialogOpen(true);
  };

  const availableTechnicians = technicians.filter((t) => t.status === 'online' && t.role === 'technician');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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

      {/* Main Content Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketStatus | 'all')} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto">
                {['all', 'new', 'assigned', 'in-progress', 'completed', 'declined'].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm capitalize relative">
                        {tab.replace('-', ' ')} ({ticketCounts[tab as keyof typeof ticketCounts]})
                        {tab === 'declined' && ticketCounts.declined > 0 && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
                        )}
                    </TabsTrigger>
                ))}
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
                  onAssign={(e) => openAssignDialog(e, ticket)}
                  onClick={() => openDetailsDialog(ticket)}
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

      {/* --- Ticket Details Dialog (New Feature) --- */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && <TicketDetailView ticket={selectedTicket} />}
        </DialogContent>
      </Dialog>

      {/* --- Assign Dialog --- */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select a technician to assign {selectedTicket?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                {availableTechnicians.length === 0 ? (
                  <SelectItem value="none" disabled>No technicians available</SelectItem>
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
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedTechnician}>Assign Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Ticket Detail Component ---

function TicketDetailView({ ticket }: { ticket: Ticket }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const status = statusConfig[ticket.status];

    // Mock Data for fields not yet in your store but requested in UI
    const machineCode = "MC-AX42";
    const model = "Apex X200";
    const category = "Breakdown";

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b pb-4">
                <div>
                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2", status.bgColor, status.color)}>
                        {status.label}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{ticket.title}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Date: {formatDate(ticket.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono">{ticket.id}</span>
                    </div>
                </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground font-medium">Machine Code</span>
                    <span className="font-semibold">{machineCode}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground font-medium">Model</span>
                    <span className="font-semibold">{model}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground font-medium">Category</span>
                    <span className="font-semibold">{category}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                    <span className="text-muted-foreground font-medium">Priority</span>
                    <Badge variant="outline" className={cn(priorityConfig[ticket.priority].color)}>
                        {priorityConfig[ticket.priority].label}
                    </Badge>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {ticket.description}
                </p>
            </div>

            {/* Audio Recording Section (New) */}
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Voice Note</h3>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-10 w-10 rounded-full shrink-0"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-1" />}
                    </Button>
                    <div className="flex-1 space-y-1">
                        <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                            <div className={cn("h-full bg-primary transition-all duration-1000", isPlaying ? "w-2/3" : "w-0")} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>0:00</span>
                            <span>0:45</span>
                        </div>
                    </div>
                    <FileAudio className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Attachments</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {/* Placeholder for images */}
                    <div className="relative group cursor-pointer overflow-hidden rounded-xl border aspect-video w-48 bg-muted">
                         <img 
                            src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2670&auto=format&fit=crop" 
                            alt="Machine Issue" 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm" className="gap-2">
                                <ImageIcon className="h-4 w-4" /> View
                            </Button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Ticket Card Component ---

function TicketCard({
  ticket,
  onAssign,
  onStatusChange,
  onClick,
}: {
  ticket: Ticket;
  onAssign: (e: React.MouseEvent) => void;
  onStatusChange: (status: TicketStatus) => void;
  onClick: () => void;
}) {
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const isDeclined = ticket.status === 'declined';

  return (
    <div
      onClick={onClick}
      className={cn(
        'border rounded-lg p-4 hover:shadow-card-hover transition-all cursor-pointer bg-card', // Added cursor-pointer
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()} // Prevent card click
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ticket.status !== 'in-progress' && ticket.status !== 'completed' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('in-progress'); }}>
                  Mark In Progress
                </DropdownMenuItem>
              )}
              {ticket.status !== 'completed' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('completed'); }}>
                  Mark Completed
                </DropdownMenuItem>
              )}
              {ticket.status !== 'declined' && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onStatusChange('declined'); }}
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