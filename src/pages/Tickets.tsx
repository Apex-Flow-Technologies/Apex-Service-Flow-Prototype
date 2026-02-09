// Admin view: manage & assign tickets only. Creation happens via customer flow.

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  MoreHorizontal, 
  FileAudio, 
  Calendar, 
  Mic, 
  UploadCloud, 
  Trash2, 
  Loader2, 
  Save, 
  Briefcase,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
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

import { useStore, Ticket } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- FIREBASE IMPORTS ---
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase"; 

// --- Configuration ---

type TicketStatus = 'new' | 'assigned' | 'in-progress' | 'completed' | 'declined';

const statusConfig: Record<TicketStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: 'Unassigned', color: 'text-primary', bgColor: 'bg-primary/10', icon: Clock },
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
    const d = date instanceof Date ? date : (date as any)?.toDate ? (date as any).toDate() : new Date();
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDate(date: Date): string {
    const d = date instanceof Date ? date : (date as any)?.toDate ? (date as any).toDate() : new Date();
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(d);
}

// --- Components ---

export default function Tickets() {
  const { tickets, technicians, assignTicket, fetchTickets, fetchTechnicians, updateTicket } = useStore();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TicketStatus | 'all'>('all');
  
  // Dialog States
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Selection States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  // --- CREATE TICKET STATES ---
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    customerName: '',
    machineCode: '',
    priority: 'medium',
    location: ''
  });
  
  // Media States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({ title: "Error", description: "Could not access microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT TICKET LOGIC ---
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const attachments = [];

      for (const file of selectedFiles) {
        const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        
        let type = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        
        attachments.push({ type, url, name: file.name });
      }

      if (audioBlob) {
        const audioRef = ref(storage, `voice_notes/${Date.now()}_voice.webm`);
        await uploadBytes(audioRef, audioBlob);
        const url = await getDownloadURL(audioRef);
        attachments.push({ type: 'audio', url, name: 'Voice Note' });
      }

      await addDoc(collection(db, "tickets"), {
        ...newTicket,
        status: 'new',
        displayId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        attachments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Success", description: "Ticket created successfully!" });
      
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const openAssignDialog = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and assign service tickets</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketStatus | 'all')} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto">
                {['all', 'new', 'assigned', 'in-progress', 'completed', 'declined'].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm capitalize relative">
                        {tab === 'new' ? 'Unassigned' : tab.replace('-', ' ')} 
                        {' '}({ticketCounts[tab as keyof typeof ticketCounts]})
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

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && <TicketDetailView ticket={selectedTicket} />}
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select a technician to assign {selectedTicket?.displayId}
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
    const status = statusConfig[ticket.status];
    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b pb-4">
                <div className="space-y-1.5 w-full">
                     <div className="flex justify-between items-center w-full mb-2">
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold", status.bgColor, status.color)}>
                            {status.label}
                        </div>
                     </div>
                    
                    {/* CUSTOMER NAME - Main Heading */}
                    <h2 className="text-2xl font-bold text-foreground">{ticket.customerName || "Unknown Customer"}</h2>
                    
                    {/* Sub Info */}
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <span>•</span>
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{ticket.displayId}</span>
                        <span>•</span>
                        <div className="font-medium text-foreground">{ticket.title}</div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
             <div className="space-y-5">
                
                {/* Description */}
                <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3 rounded-lg border shadow-sm">
                        {ticket.description}
                    </p>
                </div>

                {/* Highlighted Machine Code */}
                {ticket.machineCode && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg shadow-sm">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                            <Monitor className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Machine Involved</p>
                            <p className="font-semibold text-base text-foreground">{ticket.machineCode}</p>
                        </div>
                    </div>
                )}
            </div>

             {/* Attachments Section */}
             {(ticket.attachments?.length > 0) && (
                <div className="space-y-3 pt-2">
                     <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" /> Attachments
                     </h3>
                     
                     {/* Audio Files */}
                     {ticket.attachments.some(a => a.type === "audio") && (
                        <div className="space-y-2">
                             {ticket.attachments.filter(a => a.type === "audio").map((audio, i) => (
                                 <div key={i} className="bg-muted/50 p-2 rounded-md">
                                     <p className="text-xs text-muted-foreground mb-1">Voice Note {i+1}</p>
                                     <audio src={audio.url} controls className="w-full h-8" />
                                 </div>
                             ))}
                        </div>
                     )}

                     {/* Image/Video Files */}
                     {ticket.attachments.some(a => a.type !== "audio") && (
                         <div className="flex gap-3 overflow-x-auto pb-2">
                             {ticket.attachments.filter(a => a.type !== "audio").map((file, i) => (
                                 <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="block shrink-0 relative group">
                                     <img src={file.url} className="h-24 w-24 object-cover rounded-lg border hover:opacity-90 transition-opacity" alt="attachment" />
                                 </a>
                             ))}
                         </div>
                     )}
                </div>
             )}
        </div>
    )
}

function TicketCard({ ticket, onAssign, onStatusChange, onClick }: any) {
    const status = statusConfig[ticket.status];
    return (
        <div onClick={onClick} className="group border rounded-lg p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer bg-card relative overflow-hidden">
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", status.bgColor.replace('/10', ''))} />
            
            <div className="flex flex-col gap-3 pl-2">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        {/* CUSTOMER NAME TOP */}
                        <h3 className="font-bold text-lg text-foreground">{ticket.customerName}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{ticket.displayId}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(ticket.createdAt)}</span>
                        </div>
                    </div>
                    <div className={cn('p-1.5 rounded-md', status.bgColor)}>
                        <status.icon className={cn('h-4 w-4', status.color)} />
                    </div>
                 </div>

                 {/* MODIFIED BODY - REMOVED TITLE, KEPT FULL DESCRIPTION */}
                 <div className="space-y-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {ticket.description}
                    </p>
                 </div>

                 <div className="flex items-center justify-between mt-1 pt-3 border-t">
                    {/* Machine Code Highlighted - Location Removed */}
                    <div className="flex gap-2">
                        {ticket.machineCode && (
                            <Badge variant="secondary" className="text-xs font-medium text-foreground bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border">
                                <Monitor className="h-3 w-3 mr-1.5" /> 
                                {ticket.machineCode}
                            </Badge>
                        )}
                    </div>

                    {ticket.status === 'new' && (
                        <Button onClick={(e) => { e.stopPropagation(); onAssign(e); }} size="sm" className="h-8 text-xs gap-1.5">
                            <User className="h-3.5 w-3.5" /> Assign
                        </Button>
                    )}
                 </div>
            </div>
        </div>
    )
}