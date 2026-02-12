import { useEffect, useState } from "react";
import { 
  Upload, 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  AtSign,
  Plus, 
  MoreHorizontal, 
  Wrench, 
  Search, 
  Trash2, 
  Loader2,
  FileSpreadsheet,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  doc,
  serverTimestamp,
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch
} from "firebase/firestore";
import { db } from "@/firebase";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 50;

export default function Customers() {
  const { toast } = useToast();

  // ---------------- STATE ----------------
  const [customers, setCustomers] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Sort State
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [jumpPage, setJumpPage] = useState("");

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  
  // Forms
  const [form, setForm] = useState({ name: "", phone: "", address: "", username: "", password: "" });
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "", username: "", password: "" });

  // Bulk Upload State
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ---------------- FETCH DATA ----------------

  const fetchTotalCount = async () => {
    try {
      const coll = collection(db, "user");
      const q = query(coll, where("role", "==", "user"));
      const snapshot = await getCountFromServer(q);
      setTotalCount(snapshot.data().count);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const fetchFirstPage = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "user"),
        where("role", "==", "user"),
        orderBy(sortField, sortDir),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      
      setCustomers(data);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setPageHistory([]);
      setPage(1);
      
      fetchTotalCount(); // Update total count
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!lastDoc) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "user"),
        where("role", "==", "user"),
        orderBy(sortField, sortDir),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        setPageHistory(prev => [...prev, lastDoc]);
        const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setCustomers(data);
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setPage(p => p + 1);
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrevPage = async () => {
    if (page === 1 || pageHistory.length === 0) return;
    setIsLoading(true);
    try {
      const newHistory = pageHistory.slice(0, -1);
      let q;
      
      if (newHistory.length === 0) {
         q = query(
            collection(db, "user"),
            where("role", "==", "user"),
            orderBy(sortField, sortDir),
            limit(PAGE_SIZE)
         );
      } else {
         const startDoc = newHistory[newHistory.length - 1];
         q = query(
            collection(db, "user"),
            where("role", "==", "user"),
            orderBy(sortField, sortDir),
            startAfter(startDoc),
            limit(PAGE_SIZE)
         );
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      
      setCustomers(data);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setPageHistory(newHistory);
      setPage(p => p - 1);
    } catch (error) {
      console.error("Error fetching prev page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJumpToPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPage = parseInt(jumpPage);
    const maxPage = Math.ceil(totalCount / PAGE_SIZE);

    if (!targetPage || targetPage < 1 || targetPage > maxPage || targetPage === page) return;

    setIsLoading(true);
    try {
        let currentLastDoc = null;
        
        for (let i = 1; i < targetPage; i++) {
            let q = query(
                collection(db, "user"),
                where("role", "==", "user"),
                orderBy(sortField, sortDir),
                limit(PAGE_SIZE)
            );
            if (currentLastDoc) {
                q = query(
                    collection(db, "user"),
                    where("role", "==", "user"),
                    orderBy(sortField, sortDir),
                    startAfter(currentLastDoc),
                    limit(PAGE_SIZE)
                );
            }
            const snap = await getDocs(q);
            if (snap.empty) break;
            currentLastDoc = snap.docs[snap.docs.length - 1];
        }

        if (currentLastDoc || targetPage === 1) {
             const q = query(
                collection(db, "user"),
                where("role", "==", "user"),
                orderBy(sortField, sortDir),
                startAfter(currentLastDoc),
                limit(PAGE_SIZE)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            
            setCustomers(data);
            setLastDoc(snap.docs[snap.docs.length - 1]);
            setPageHistory([]); // Reset history on jump
            setPage(targetPage);
        }
    } catch (error) {
        console.error("Jump failed", error);
        toast({ title: "Could not jump to page", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setJumpPage("");
    }
  };

  const fetchAllForBulkCheck = async () => {
      const q = query(collection(db, "user"), where("role", "==", "user"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  };

  const fetchMachines = async () => {
    try {
      const snap = await getDocs(collection(db, "machines"));
      setMachines(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  useEffect(() => {
    fetchFirstPage();
    fetchMachines();
  }, [sortField, sortDir]);

  // ---------------- HELPERS ----------------
  const getMachineLabel = (m: any) => m?.machineCode || "Unnamed Machine";

  const assignedMachines = (customerId: string) =>
    machines.filter((m) => m.assignedTo === customerId);

  const availableMachines = () =>
    machines
      .filter((m) => !m.assignedTo)
      .sort((a, b) => (b.machineCode || "").localeCompare(a.machineCode || ""));

  // ---------------- HANDLERS ----------------

  const handleSort = (field: string) => {
      if (sortField === field) {
          setSortDir(sortDir === "asc" ? "desc" : "asc");
      } else {
          setSortField(field);
          setSortDir("asc");
      }
  };

  const handleEditClick = (customer: any) => {
    setEditCustomer(customer);
    // Explicitly map fields, default to empty string if undefined (PRESERVED)
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      username: customer.username || "",
      password: "", // Reset password field on open
    });
  };

  const saveCustomerEdits = async () => {
    if (!editCustomer?.id) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "user", editCustomer.id);
      const updateData: any = {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        username: editForm.username,
      };
      if (editForm.password.trim() !== "") {
        updateData.password = editForm.password;
      }
      await updateDoc(docRef, updateData);
      
      setCustomers((prev) =>
        prev.map((c) => c.id === editCustomer.id ? { ...c, ...updateData } : c)
      );
      toast({ title: "Customer updated" });
      setEditCustomer(null);
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const createCustomer = async () => {
    if (!form.name || !form.username || !form.password) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, "user"), {
        ...form,
        role: "user",
        createdAt: serverTimestamp(),
      });
      fetchFirstPage(); 
      toast({ title: "Customer created" });
      setForm({ name: "", phone: "", address: "", username: "", password: "" });
      setAddOpen(false);
    } catch (error) {
      toast({ title: "Failed to create", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const assignMachine = async (machineId: string) => {
    if (!editCustomer?.id) return;
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, assignedTo: editCustomer.id } : m));
    await updateDoc(doc(db, "machines", machineId), { assignedTo: editCustomer.id });
  };

  const unassignMachine = async (machineId: string) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, assignedTo: null } : m));
    await updateDoc(doc(db, "machines", machineId), { assignedTo: null });
  };

  const deleteCustomer = async (customer: any) => {
    if(!confirm("Are you sure?")) return;
    
    // Optimistic update
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    setMachines(prev => prev.map(m => m.assignedTo === customer.id ? { ...m, assignedTo: null } : m));

    try {
        const related = machines.filter((m) => m.assignedTo === customer.id);
        for (const m of related) {
          await updateDoc(doc(db, "machines", m.id), { assignedTo: null });
        }
        await deleteDoc(doc(db, "user", customer.id));
        fetchTotalCount(); // Refresh count
        toast({ title: "Customer deleted" });
    } catch (error) {
        console.error("Delete failed", error);
        toast({ title: "Error deleting customer", variant: "destructive" });
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ---------------- BATCH UPLOAD FUNCTION (HIGH PERFORMANCE) ----------------
  const uploadInBatches = async (rows: any[]) => {
    const CHUNK_SIZE = 500;
    const chunks = [];
    
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }

    let totalDone = 0;

    for (const chunk of chunks) {
        const batch = writeBatch(db);
        
        chunk.forEach((r: any) => {
            const docRef = doc(collection(db, "user"));
            batch.set(docRef, {
                name: r.name || "",
                username: r.username || "",
                phone: r.phone || "",
                address: r.address || "",
                legacyCustomerId: r.legacyCustomerId || null, 
                role: "user",
                createdAt: serverTimestamp(),
            });
        });

        await batch.commit();
        totalDone += chunk.length;
        setUploadProgress(Math.round((totalDone / rows.length) * 100));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customers and assign machines</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-green-600 text-green-600" 
            onClick={() => setBulkOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" /> 
            Bulk Upload
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Customer List <span className="ml-2 text-sm text-muted-foreground font-normal">({totalCount} total)</span></CardTitle>
            
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowUpDown className="h-4 w-4" /> Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSort("name")}>
                            Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                            Date Created {sortField === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search this page..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Machines</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                          <TableCell><div className="h-4 w-32 bg-slate-100 rounded animate-pulse"/></TableCell>
                          <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse"/></TableCell>
                          <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse"/></TableCell>
                          <TableCell><div className="h-4 w-8 bg-slate-100 rounded animate-pulse"/></TableCell>
                          <TableCell/>
                      </TableRow>
                  ))
              ) : filteredCustomers.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No customers found on this page.</TableCell>
                 </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.username || "-"}</TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {assignedMachines(c.id).length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(c)}>
                            <Wrench className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteCustomer(c)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* RIGHT ALIGNED PAGINATION */}
        <CardFooter className="flex items-center justify-end gap-6 border-t py-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Go to:</span>
                <form onSubmit={handleJumpToPage} className="flex items-center">
                    <Input 
                        type="number" 
                        min={1} 
                        max={totalPages} 
                        value={jumpPage}
                        onChange={(e) => setJumpPage(e.target.value)}
                        className="h-8 w-16 text-center"
                        placeholder="#"
                    />
                </form>
            </div>

            <div className="text-sm font-medium">
                Page {page} of {totalPages}
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchPrevPage} disabled={page === 1 || isLoading}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={fetchNextPage} disabled={page >= totalPages || isLoading}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </CardFooter>
      </Card>

      {/* ---------------- ADD DIALOG ---------------- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="9876543210" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="City, State" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>App Username</Label>
                    <Input placeholder="user123" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={createCustomer} disabled={isSaving}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- EDIT DIALOG (Fixed) ---------------- */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update details and manage machine assignments.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="edit-name" className="pl-9" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="edit-phone" 
                            className="pl-9" 
                            value={editForm.phone} 
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value.replace(/\D/g, '')})} 
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="edit-address" className="pl-9" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-username">App Username</Label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="edit-username" className="pl-9" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-password">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="edit-password" 
                            className="pl-9" 
                            placeholder="Leave empty to keep current" 
                            value={editForm.password} 
                            onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                        />
                    </div>
                </div>
            </div>

            {/* MACHINE ASSIGNMENT SECTION (Preserved) */}
            {editCustomer?.id && (
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Assigned Machines</h4>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed gap-2">
                                    <Plus className="h-3 w-3" /> Assign New
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="end">
                                <Command>
                                    <CommandInput placeholder="Search machine..." />
                                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                                        {availableMachines().length === 0 ? (
                                            <div className="p-3 text-xs text-center text-muted-foreground">No unassigned machines found.</div>
                                        ) : (
                                            availableMachines().map((m) => (
                                                <CommandItem key={m.id} onSelect={() => assignMachine(m.id)}>
                                                    <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {getMachineLabel(m)}
                                                </CommandItem>
                                            ))
                                        )}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        {assignedMachines(editCustomer.id).length === 0 ? (
                            <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md text-center">No machines currently assigned.</div>
                        ) : (
                            assignedMachines(editCustomer.id).map((m) => (
                                <div key={m.id} className="flex justify-between items-center bg-card border rounded-md p-2 pl-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded"><Wrench className="h-3.5 w-3.5" /></div>
                                        <span className="text-sm font-medium">{getMachineLabel(m)}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => unassignMachine(m.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button onClick={saveCustomerEdits} disabled={isSaving}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- BULK UPLOAD DIALOG ---------------- */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader><DialogTitle>Bulk Upload Customers</DialogTitle></DialogHeader>
          {!bulkPreview.length ? (
            <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer" onClick={() => document.getElementById("bulkFile")?.click()}>
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Click to select .xlsx file</p>
              <input id="bulkFile" type="file" accept=".xlsx" hidden onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const buffer = await file.arrayBuffer();
                  const wb = XLSX.read(buffer);
                  const ws = wb.Sheets[wb.SheetNames[0]];
                  const rawRows = XLSX.utils.sheet_to_json(ws) as any[];
                  
                  // Fetch for dup check
                  const dbData = await fetchAllForBulkCheck();
                  const dbIds = new Set(dbData.map((c: any) => String(c.legacyCustomerId || "").trim()));
                  const seenIdsInFile = new Set<string>();
                  
                  const processedRows = rawRows.map((r: any) => {
                    const name = (r.name || r.Name || r["Full Name"] || "").toString().trim();
                    const legacyId = (r.legacyCustomerId || r["legacyCustomerId"] || "").toString().trim();
                    let rawUsername = (r.username || r.Username || r["User Name"] || "").toString().trim();
                    if (!rawUsername && name) rawUsername = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    if (!name && !legacyId) return null;
                    
                    let status = "Ready";
                    if (legacyId && dbIds.has(legacyId)) status = "Already exists in database";
                    else if (legacyId && seenIdsInFile.has(legacyId)) status = "Repeated in File";
                    else { status = "Ready"; if (legacyId) seenIdsInFile.add(legacyId); }
                    
                    return { ...r, name, username: rawUsername, legacyCustomerId: legacyId, phone: (r.phone || "").toString(), address: (r.address || "").toString(), _status: status };
                  }).filter(Boolean);
                  setBulkPreview(processedRows); 
              }} />
            </div>
          ) : (
            <>
              <div className="bg-muted/30 p-3 rounded-md text-sm mb-2 flex justify-between">
                  <span>Total: {bulkPreview.length}</span>
                  <span className="text-green-600">Ready: {bulkPreview.filter((r:any)=>r._status==="Ready").length}</span>
                  <span className="text-red-600">Skipped: {bulkPreview.filter((r:any)=>r._status!=="Ready").length}</span>
              </div>
              {bulkUploading && <div className="w-full bg-muted h-2 rounded-full mb-3"><div className="bg-primary h-2 rounded-full" style={{width: `${uploadProgress}%`}}/></div>}
              
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 sticky top-0">
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bulkPreview.map((r:any,i)=> {
                            const isReady = r._status === "Ready";
                            return (
                                <TableRow key={i} className={!isReady ? "bg-red-50" : ""}>
                                    <TableCell className="font-mono text-xs">{r.legacyCustomerId}</TableCell>
                                    <TableCell>{r.name}</TableCell>
                                    <TableCell>
                                        <div className={`flex items-center gap-2 text-xs font-medium ${isReady ? 'text-green-600' : 'text-red-600'}`}>
                                            {!isReady && <AlertCircle className="h-3 w-3"/>}
                                            {r._status}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="ghost" onClick={()=>setBulkPreview([])} disabled={bulkUploading}>Clear</Button>
                {/* BATCH UPLOAD TRIGGER */}
                <Button onClick={async ()=>{
                    setBulkUploading(true);
                    
                    // Filter valid rows
                    const validRows = bulkPreview.filter((r: any) => r._status === "Ready");
                    
                    // Call the batch upload function
                    await uploadInBatches(validRows);

                    setBulkUploading(false); setBulkPreview([]); setBulkOpen(false); fetchFirstPage();
                    toast({ title: "Bulk upload complete", description: `${validRows.length} customers uploaded.` });
                }} disabled={bulkUploading || bulkPreview.filter((r:any)=>r._status==="Ready").length === 0}>
                    {bulkUploading ? "Uploading..." : `Confirm Upload (${bulkPreview.filter((r:any)=>r._status==="Ready").length})`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}