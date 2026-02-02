import { useState } from 'react';
import { Search, Wrench, MoreHorizontal, Edit, Check, ChevronsUpDown, Trash2, Ticket, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// --- MOCK DATA (Updated with Ticket ID, Category, and Technicians only) ---
const initialMachines = [
  { id: "M-1001", code: "MC-AX42", name: "Apex X200", owner: "John Doe (Technician)", ticketId: "TKT-101", category: "Breakdown" },
  { id: "M-1002", code: "MC-TV01", name: "Titan V1", owner: "Unassigned", ticketId: "-", category: "Maintenance" },
  { id: "M-1003", code: "MC-HX05", name: "Hydra X5", owner: "Mike Ross (Technician)", ticketId: "TKT-105", category: "Repair" },
  { id: "M-1004", code: "MC-Q900", name: "Quantum 9", owner: "Sarah Jones (Technician)", ticketId: "TKT-109", category: "Inspection" },
];

// Mock Users (Technicians Only)
const mockUsers = [
  { label: "Unassigned", value: "Unassigned" },
  { label: "John Doe (Technician)", value: "John Doe (Technician)" },
  { label: "Mike Ross (Technician)", value: "Mike Ross (Technician)" },
  { label: "Sarah Jones (Technician)", value: "Sarah Jones (Technician)" },
  { label: "Alex Smith (Technician)", value: "Alex Smith (Technician)" },
];

export default function Machines() {
  const [machines, setMachines] = useState(initialMachines);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // --- ADD MACHINE STATES ---
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [openOwnerSelect, setOpenOwnerSelect] = useState(false);
  const [newMachine, setNewMachine] = useState({
    code: '',
    name: '',
    ticketId: '',
    category: '',
    owner: ''
  });

  // --- EDIT MACHINE STATES ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [openEditOwnerSelect, setOpenEditOwnerSelect] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);

  // Filter logic
  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS ---

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `M-${Math.floor(1000 + Math.random() * 9000)}`;
    const machineToAdd = { 
        ...newMachine, 
        id, 
        owner: newMachine.owner || "Unassigned",
        ticketId: newMachine.ticketId || "-", // Default to dash if empty
        category: newMachine.category || "General" 
    };
    
    setMachines([...machines, machineToAdd]);
    setIsAddDialogOpen(false);
    setNewMachine({ code: '', name: '', ticketId: '', category: '', owner: '' }); // Reset
    
    toast({
      title: "Machine Added",
      description: `${machineToAdd.name} has been added to inventory.`
    });
  };

  const openEditDialog = (machine: any) => {
    setEditingMachine(machine);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMachines = machines.map((m) => 
      m.id === editingMachine.id ? editingMachine : m
    );
    
    setMachines(updatedMachines);
    setIsEditDialogOpen(false);
    setEditingMachine(null);

    toast({
      title: "Machine Updated",
      description: "Machine details have been saved."
    });
  };

  const handleDeleteMachine = (id: string) => {
    // Removed window.confirm to prevent "localhost pops up"
    const updatedMachines = machines.filter((m) => m.id !== id);
    setMachines(updatedMachines);
    toast({
        title: "Machine Removed",
        description: "The machine has been removed from inventory.",
        variant: "destructive" // Shows red toast
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Machine List</h1>
          <p className="text-muted-foreground mt-1">Inventory and assignment tracking</p>
        </div>
        
        {/* --- ADD MACHINE DIALOG --- */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Wrench className="h-4 w-4" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] overflow-visible">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>Enter the details of the new equipment.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMachine} className="grid gap-4 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      placeholder="MC-XXXX"
                      value={newMachine.code}
                      onChange={(e) => setNewMachine({...newMachine, code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Machine Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Apex X200"
                      value={newMachine.name}
                      onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                      required
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketId">Ticket ID</Label>
                    <Input
                      id="ticketId"
                      placeholder="TKT-000"
                      value={newMachine.ticketId}
                      onChange={(e) => setNewMachine({...newMachine, ticketId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g. Repair"
                      value={newMachine.category}
                      onChange={(e) => setNewMachine({...newMachine, category: e.target.value})}
                    />
                  </div>
              </div>

              {/* OWNER COMBOBOX */}
              <div className="space-y-2">
                <Label>Assigned Technician</Label>
                <Popover open={openOwnerSelect} onOpenChange={setOpenOwnerSelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openOwnerSelect}
                        className="w-full justify-between font-normal"
                      >
                        {newMachine.owner
                          ? mockUsers.find((user) => user.value === newMachine.owner)?.label
                          : "Select technician..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                      <Command>
                        <CommandInput placeholder="Search technician..." />
                        <CommandList>
                          <CommandEmpty>No technician found.</CommandEmpty>
                          <CommandGroup>
                            {mockUsers.map((user) => (
                              <CommandItem
                                key={user.value}
                                value={user.label}
                                onSelect={() => {
                                  setNewMachine({ ...newMachine, owner: user.value });
                                  setOpenOwnerSelect(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newMachine.owner === user.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {user.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
              </div>

              <DialogFooter>
                <Button type="submit">Save Machine</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Inventory</CardTitle>
              <CardDescription>{machines.length} total machines registered</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[150px]">Code</TableHead>
                  <TableHead className="w-[200px]">Machine Name</TableHead>
                  <TableHead className="w-[150px]">Ticket ID</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead>Assigned Technician</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMachines.map((machine) => (
                  <TableRow key={machine.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium text-primary">
                      {machine.code}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        {machine.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {machine.ticketId !== '-' && <Ticket className="h-3 w-3 text-muted-foreground" />}
                        <span className="font-mono text-xs">{machine.ticketId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       {machine.category && (
                           <Badge variant="secondary" className="font-normal text-xs">
                                {machine.category}
                           </Badge>
                       )}
                    </TableCell>
                    <TableCell>
                      <span className={!machine.owner || machine.owner === 'Unassigned' ? 'text-muted-foreground italic' : ''}>
                        {machine.owner || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(machine)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMachine(machine.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- EDIT MACHINE DIALOG --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] overflow-visible">
          <DialogHeader>
            <DialogTitle>Edit Machine</DialogTitle>
            <DialogDescription>Update machine details.</DialogDescription>
          </DialogHeader>
          {editingMachine && (
            <form onSubmit={handleUpdateMachine} className="grid gap-4 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Code</Label>
                    <Input
                      id="edit-code"
                      value={editingMachine.code}
                      onChange={(e) => setEditingMachine({...editingMachine, code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Machine Name</Label>
                    <Input
                      id="edit-name"
                      value={editingMachine.name}
                      onChange={(e) => setEditingMachine({...editingMachine, name: e.target.value})}
                      required
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-ticketId">Ticket ID</Label>
                    <Input
                      id="edit-ticketId"
                      value={editingMachine.ticketId}
                      onChange={(e) => setEditingMachine({...editingMachine, ticketId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={editingMachine.category}
                      onChange={(e) => setEditingMachine({...editingMachine, category: e.target.value})}
                    />
                  </div>
              </div>

              {/* EDIT OWNER COMBOBOX */}
              <div className="space-y-2">
                <Label>Assigned Technician</Label>
                <Popover open={openEditOwnerSelect} onOpenChange={setOpenEditOwnerSelect}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openEditOwnerSelect}
                        className="w-full justify-between"
                      >
                        {editingMachine.owner
                          ? mockUsers.find((user) => user.value === editingMachine.owner)?.label || editingMachine.owner
                          : "Select technician..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                      <Command>
                        <CommandInput placeholder="Search technician..." />
                        <CommandList>
                          <CommandEmpty>No technician found.</CommandEmpty>
                          <CommandGroup>
                            {mockUsers.map((user) => (
                              <CommandItem
                                key={user.value}
                                value={user.label}
                                onSelect={() => {
                                  setEditingMachine({ ...editingMachine, owner: user.value });
                                  setOpenEditOwnerSelect(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    editingMachine.owner === user.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {user.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
              </div>

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}