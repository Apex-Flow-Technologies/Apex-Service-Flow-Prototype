import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  User as UserIcon, 
  Lock, 
  Wrench,
  Check,
  ChevronsUpDown,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { cn } from "@/lib/utils";

// --- MOCK MACHINES ---
const machines = [
  { label: "General Pool (Default)", value: "general_pool" },
  { label: "Apex X200 (MC-AX42)", value: "MC-AX42" },
  { label: "Titan V1 (MC-TV01)", value: "MC-TV01" },
  { label: "Hydra X5 (MC-HX05)", value: "MC-HX05" },
  { label: "Quantum 9 (MC-Q900)", value: "MC-Q900" },
];

// --- MOCK USERS ---
const initialUsers = [
  { id: "1", name: "John Doe", username: "jdoe", email: "john@apex.com", phone: "123-456-7890", machineId: "MC-AX42", role: "user" },
  { id: "2", name: "Alice Smith", username: "alice_s", email: "alice@apex.com", phone: "987-654-3210", machineId: "general_pool", role: "user" },
  { id: "3", name: "Robert Fox", username: "robert_f", email: "robert@apex.com", phone: "555-123-4567", machineId: "MC-TV01", role: "user" },
];

// --- SCHEMA ---
const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  machine: z.string().optional(),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function Users() { 
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // --- DIALOG STATES ---
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // --- UI STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [openMachineSelect, setOpenMachineSelect] = useState(false);
  
  // --- EDIT STATE ---
  const [editingUser, setEditingUser] = useState<any>(null);
  const [openEditMachineSelect, setOpenEditMachineSelect] = useState(false);

  // --- FORM SETUP ---
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { username: '', name: '', email: '', password: '', phone: '', machine: '' }
  });

  const selectedMachine = watch("machine");

  // --- ADD HANDLER ---
  const onAddUserSubmit = (data: AddUserFormValues) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: data.username,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      machineId: data.machine || "general_pool", 
      role: "user", 
      password: data.password 
    };

    setUsers([...users, newUser]);

    toast({ title: "User Created", description: `${data.name} added successfully.` });
    
    reset();
    setValue("machine", "");
    setIsAddDialogOpen(false);
  };

  // --- EDIT HANDLERS ---
  const openEditDialog = (user: any) => {
    setEditingUser({ ...user }); 
    setIsEditDialogOpen(true);
  };

  const onUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = users.map((u) => 
        u.id === editingUser.id ? editingUser : u
    );

    setUsers(updatedUsers);
    toast({ title: "User Updated", description: "Changes saved successfully." });
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId)); 
    toast({ 
        title: "User Removed", 
        description: "The user has been removed from the team.",
        variant: "destructive" 
    });
  };

  // --- FILTERING ---
  const filteredUsers = users.filter((user) => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system access and members</p>
        </div>

        {/* --- ADD BUTTON --- */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create an account for a new team member.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onAddUserSubmit)} className="space-y-4 py-2">
               {/* Row 1: Username & Password */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Username</Label>
                      <div className="relative">
                          <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="jdoe" className="pl-9" {...register('username')} />
                      </div>
                      {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                          <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••" className="pl-9" {...register('password')} />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-2" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>
               </div>

               {/* Row 2: Name & Email */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" {...register('name')} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="john@company.com" className="pl-9" {...register('email')} />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
               </div>

               {/* Row 3: Phone & Machine Assignment (Aligned) */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="relative">
                          <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+1 234 567 8900" className="pl-9" {...register('phone')} />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <Label>Owned Machine (Optional)</Label>
                      <Popover open={openMachineSelect} onOpenChange={setOpenMachineSelect}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between font-normal pl-3 text-left">
                            <span className="flex items-center gap-2 truncate">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              {selectedMachine ? machines.find((m) => m.value === selectedMachine)?.label : <span className="text-muted-foreground">Default (General Pool)</span>}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0">
                          <Command>
                            <CommandInput placeholder="Search machine..." />
                            <CommandList>
                              <CommandEmpty>No machine found.</CommandEmpty>
                              <CommandGroup>
                                {machines.map((machine) => (
                                  <CommandItem key={machine.value} value={machine.label} onSelect={() => { setValue("machine", machine.value === selectedMachine ? "" : machine.value); setOpenMachineSelect(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", selectedMachine === machine.value ? "opacity-100" : "opacity-0")} />
                                    {machine.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                  </div>
               </div>

               <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Create User
                  </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- USER LIST TABLE --- */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>{users.length} registered users</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, username..."
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
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Owned Machine</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No users found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        {/* Name Column */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{user.name}</span>
                              <span className="text-xs text-muted-foreground">@{user.username || "user"}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email Column */}
                        <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" /> {user.email}
                            </div>
                        </TableCell>

                        {/* Phone Column */}
                        <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" /> {user.phone || "-"}
                            </div>
                        </TableCell>

                        {/* Machine Column (Normal Font) */}
                        <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Wrench className="h-3 w-3" />
                                <span>
                                    {machines.find(m => m.value === user.machineId)?.label || "General Pool"}
                                </span>
                            </div>
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- EDIT USER DIALOG --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user details.</DialogDescription>
            </DialogHeader>
            {editingUser && (
                <form onSubmit={onUpdateUserSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={editingUser.username} onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={editingUser.phone} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Owned Machine</Label>
                        <Popover open={openEditMachineSelect} onOpenChange={setOpenEditMachineSelect}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-left">
                                    {editingUser.machineId ? machines.find((m) => m.value === editingUser.machineId)?.label : "Select machine..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search..." />
                                    <CommandList>
                                        <CommandGroup>
                                            {machines.map((machine) => (
                                                <CommandItem key={machine.value} value={machine.label} onSelect={() => { 
                                                    setEditingUser({...editingUser, machineId: machine.value === editingUser.machineId ? "general_pool" : machine.value}); 
                                                    setOpenEditMachineSelect(false); 
                                                }}>
                                                    <Check className={cn("mr-2 h-4 w-4", editingUser.machineId === machine.value ? "opacity-100" : "opacity-0")} />
                                                    {machine.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}