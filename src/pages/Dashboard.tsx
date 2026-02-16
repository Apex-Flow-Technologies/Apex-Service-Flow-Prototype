import { 
  Ticket, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { useEffect } from "react";

// Configuration matches Tickets.tsx
const REFRESH_INTERVAL = 5000; 

export default function Dashboard() {
  // Use the global store instead of local state to ensure data consistency
  const { tickets, technicians, activities, fetchTickets, fetchTechnicians, listenToActivities } = useStore();

  // --- Auto-Refresh Logic (Same as Tickets Page) ---
  useEffect(() => {
    // 1. Initial Fetch
    fetchTickets();
    fetchTechnicians();

    // 2. Poll for updates
    const intervalId = setInterval(() => {
      fetchTickets();
      fetchTechnicians();
    }, REFRESH_INTERVAL);

    // 3. Listen to activities (Firestore listener)
    const unsubscribeActivities = listenToActivities();

    // Cleanup
    return () => {
      clearInterval(intervalId);
      unsubscribeActivities(); 
    };
  }, []);

  // Corrected Status Logic (Matches Tickets.tsx exactly)
  const ticketsByStatus = {
    new: tickets.filter((t) => t.status === 'new').length, 
    assigned: tickets.filter((t) => t.status === 'assigned').length,
    'in progress': tickets.filter((t) => t.status === 'in-progress').length, // Fixed hyphen
    completed: tickets.filter((t) => t.status === 'completed').length,
    declined: tickets.filter((t) => t.status === 'declined').length,
  };

  const stats = [
    {
      title: 'Total Tickets',
      value: tickets.length,
      icon: Ticket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Assignment',
      value: ticketsByStatus.new, 
      icon: Clock,
      trendUp: false,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Active Technicians',
      value: technicians.filter((t) => t.status === 'online').length,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Completed Today',
      value: ticketsByStatus.completed,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your service operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-card-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {/* Trend logic removed for now as per previous code */}
                  </div>
                </div>
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Status Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Ticket Status</CardTitle>
            <CardDescription>Current distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBar label="New" count={ticketsByStatus.new} total={tickets.length} color="bg-primary" />
            <StatusBar label="Assigned" count={ticketsByStatus.assigned} total={tickets.length} color="bg-blue-500" />
            <StatusBar label="In Progress" count={ticketsByStatus['in progress']} total={tickets.length} color="bg-amber-500" />
            <StatusBar label="Completed" count={ticketsByStatus.completed} total={tickets.length} color="bg-green-500" />
            <StatusBar label="Declined" count={ticketsByStatus.declined} total={tickets.length} color="bg-red-500" />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest actions from your team</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Live
              <span className="ml-1 h-2 w-2 rounded-full bg-success animate-pulse-soft inline-block" />
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
              ) : (
                  activities.slice(0, 6).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        'p-2 rounded-lg flex-shrink-0',
                        activity.type === 'completion' ? 'bg-success/10' :
                        activity.type === 'assignment' ? 'bg-primary/10' :
                        activity.type === 'creation' ? 'bg-accent' :
                        'bg-muted'
                      )}>
                        {activity.type === 'completion' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : activity.type === 'assignment' ? (
                          <ArrowUpRight className="h-4 w-4 text-primary" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{count}</span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatTimeAgo(dateInput: any): string {
  if (!dateInput) return '';
  // Handle Firestore Timestamp or standard JS Date
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}