import { useState } from 'react';
import { Search, Wrench, MoreHorizontal, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast'; // Ensure this path is correct for your project

// --- MOCK DATA ---
const initialMachines = [
  { id: "M-1001", code: "MC-AX42", name: "Apex X200", owner: "John Doe (Tech)", status: "Active" },
  { id: "M-1002", code: "MC-TV01", name: "Titan V1", owner: "Unassigned", status: "Maintenance" },
  { id: "M-1003", code: "MC-HX05", name: "Hydra X5", owner: "Sarah Smith (Manager)", status: "Active" },
  { id: "M-1004", code: "MC-Q900", name: "Quantum 9", owner: "ABC Corp (Client)", status: "Offline" },
];

export default function Machines() {
  const [machines, setMachines] = useState(initialMachines);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // --- ADD MACHINE STATES ---
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({
    code: '',
    name: '',
    owner: '',
    status: 'Active'
  });

  // --- EDIT MACHINE STATES ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);

  // Filter logic
  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS ---

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `M-${Math.floor(1000 + Math.random() * 9000)}`; // Generate random ID
    const machineToAdd = { ...newMachine, id };
    
    setMachines([...machines, machineToAdd]);
    setIsAddDialogOpen(false);
    setNewMachine({ code: '', name: '', owner: '', status: 'Active' }); // Reset form
    
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>
                Enter the details of the new equipment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMachine} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input
                  id="code"
                  placeholder="MC-XXXX"
                  value={newMachine.code}
                  onChange={(e) => setNewMachine({...newMachine, code: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  placeholder="Machine Name"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner" className="text-right">Owner</Label>
                <Input
                  id="owner"
                  placeholder="Assigned To (Optional)"
                  value={newMachine.owner}
                  onChange={(e) => setNewMachine({...newMachine, owner: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select 
                  value={newMachine.status} 
                  onValueChange={(val) => setNewMachine({...newMachine, status: val})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
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
                placeholder="Search code, name, or owner..."
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
                  <TableHead className="w-[150px]">Machine Code</TableHead>
                  <TableHead className="w-[200px]">Machine Name</TableHead>
                  <TableHead className="w-[150px]">Machine ID</TableHead>
                  <TableHead>Owned By</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="text-muted-foreground text-sm">
                      {machine.id}
                    </TableCell>
                    <TableCell>
                      <span className={!machine.owner || machine.owner === 'Unassigned' ? 'text-muted-foreground italic' : ''}>
                        {machine.owner || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          machine.status === 'Active' ? 'bg-green-500/10 text-green-600 border-green-200' :
                          machine.status === 'Maintenance' ? 'bg-orange-500/10 text-orange-600 border-orange-200' :
                          'bg-gray-500/10 text-gray-600 border-gray-200'
                        }
                      >
                        {machine.status}
                      </Badge>
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
                            Edit Machine
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Machine</DialogTitle>
            <DialogDescription>
              Update machine details.
            </DialogDescription>
          </DialogHeader>
          {editingMachine && (
            <form onSubmit={handleUpdateMachine} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-code" className="text-right">Code</Label>
                <Input
                  id="edit-code"
                  value={editingMachine.code}
                  onChange={(e) => setEditingMachine({...editingMachine, code: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={editingMachine.name}
                  onChange={(e) => setEditingMachine({...editingMachine, name: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-owner" className="text-right">Owner</Label>
                <Input
                  id="edit-owner"
                  value={editingMachine.owner}
                  onChange={(e) => setEditingMachine({...editingMachine, owner: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select 
                  value={editingMachine.status} 
                  onValueChange={(val) => setEditingMachine({...editingMachine, status: val})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
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