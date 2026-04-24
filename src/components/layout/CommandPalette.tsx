import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Ticket,
  Search,
  Users,
  LayoutDashboard,
  Plus
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { tickets, technicians } = useStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 md:hidden"
      >
        <Search className="h-6 w-6" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/tickets"))}>
              <Ticket className="mr-2 h-4 w-4" />
              <span>Tickets</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/technicians"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Technicians</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
             <CommandItem onSelect={() => runCommand(() => navigate("/tickets"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Ticket</span>
            </CommandItem>
          </CommandGroup>

          {tickets.length > 0 && (
            <CommandGroup heading="Recent Tickets">
              {tickets.slice(0, 5).map((ticket) => (
                <CommandItem 
                  key={ticket.id} 
                  onSelect={() => runCommand(() => navigate(`/tickets?id=${ticket.id}`))}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>{ticket.displayId} - {ticket.customerName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {technicians.length > 0 && (
            <CommandGroup heading="Technicians">
              {technicians.slice(0, 5).map((tech) => (
                <CommandItem 
                  key={tech.id} 
                  onSelect={() => runCommand(() => navigate(`/technicians?id=${tech.id}`))}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{tech.name} ({tech.status})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
