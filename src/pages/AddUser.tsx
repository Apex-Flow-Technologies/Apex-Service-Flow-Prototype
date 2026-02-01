import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// Added Check and ChevronsUpDown for the dropdown UI
import { Loader2, UserPlus, Eye, EyeOff, Save, Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- NEW IMPORTS FOR SEARCHABLE DROPDOWN ---
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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// --- MOCK DATA FOR MACHINES ---
const machines = [
  { label: "Apex X200 (MC-AX42)", value: "MC-AX42" },
  { label: "Titan V1 (MC-TV01)", value: "MC-TV01" },
  { label: "Hydra X5 (MC-HX05)", value: "MC-HX05" },
  { label: "Quantum 9 (MC-Q900)", value: "MC-Q900" },
  { label: "Nebula S (MC-NS11)", value: "MC-NS11" },
  { label: "Vortex M3 (MC-VM03)", value: "MC-VM03" },
];

// Schema - Added 'machine' field
const addUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['technician', 'manager', 'admin']),
  phone: z.string().optional(),
  machine: z.string().optional(), // Optional machine assignment
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function AddUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for the Machine Combobox
  const [openMachineSelect, setOpenMachineSelect] = useState(false);
  
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      role: 'technician',
      name: '',
      email: '',
      password: '',
      phone: '',
      machine: ''
    }
  });

  // Watch the machine value to display selected label
  const selectedMachine = watch("machine");

  const onSubmit = async (data: AddUserFormValues) => {
    setIsLoading(true);

    try {
      // Save to Firestore
      await addDoc(collection(db, "user"), {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone || "",
        // Save the selected machine ID
        machineId: data.machine || null, 
        status: "offline",
        activeJobs: 0,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "User Created",
        description: `${data.name} has been added as a ${data.role}.`,
      });

      reset();
      // Reset manual select states if needed
      setValue("machine", ""); 

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pt-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New User</h1>
        <p className="text-muted-foreground mt-1">Create an account for a new team member</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
               <UserPlus className="h-5 w-5 text-primary" />
             </div>
             <div>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Enter the credentials for the new employee</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Name & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                
               
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@company.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••" 
                    {...register('password')} 
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Machine Assignment (Searchable Dropdown) */}
            <div className="space-y-2">
                <Label>Assign Machine (Optional)</Label>
                <Popover open={openMachineSelect} onOpenChange={setOpenMachineSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMachineSelect}
                      className="w-full justify-between font-normal"
                    >
                      {selectedMachine
                        ? machines.find((m) => m.value === selectedMachine)?.label
                        : "Select machine..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Search machine code..." />
                      <CommandList>
                        <CommandEmpty>No machine found.</CommandEmpty>
                        <CommandGroup>
                          {machines.map((machine) => (
                            <CommandItem
                              key={machine.value}
                              value={machine.label} // Searching by label text
                              onSelect={() => {
                                setValue("machine", machine.value === selectedMachine ? "" : machine.value);
                                setOpenMachineSelect(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedMachine === machine.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {machine.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" placeholder="+1 234 567 8900" {...register('phone')} />
            </div>

            <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Create Account
                </Button>
            </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}