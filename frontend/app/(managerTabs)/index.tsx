import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { BarChart3, Ticket, Users, Clock, CheckCircle2, AlertTriangle, Plus, Settings } from 'lucide-react-native'

const ManagerHome = () => {
  const kpis = [
    { label: 'Open Tickets', value: 24, icon: <Ticket color="#1e88e5" size={22} />, bg: '#E3F2FD' },
    { label: 'SLA Breaches', value: 3, icon: <AlertTriangle color="#d32f2f" size={22} />, bg: '#FFEBEE' },
    { label: 'Technicians', value: 12, icon: <Users color="#2e7d32" size={22} />, bg: '#E8F5E9' },
    { label: 'Resolved Today', value: 18, icon: <CheckCircle2 color="#00897b" size={22} />, bg: '#E0F2F1' },
  ]

  const recent = [
    { id: 'TCK-1042', title: 'Printer not working', status: 'Open', priority: 'High', time: '10m ago' },
    { id: 'TCK-1041', title: 'Email sync issue', status: 'In Progress', priority: 'Medium', time: '42m ago' },
    { id: 'TCK-1039', title: 'Network latency', status: 'Resolved', priority: 'Low', time: '1h ago' },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Manager Dashboard</Text>

      <View style={styles.kpiGrid}>
        {kpis.map((k) => (
          <View key={k.label} style={[styles.kpiCard, { backgroundColor: k.bg }] }>
            <View style={styles.kpiIcon}>{k.icon}</View>
            <Text style={styles.kpiValue}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Plus color="#fff" size={20} />
            <Text style={styles.actionText}>New Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6C63FF' }]} activeOpacity={0.85}>
            <BarChart3 color="#fff" size={20} />
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#00BFA5' }]} activeOpacity={0.85}>
            <Settings color="#fff" size={20} />
            <Text style={styles.actionText}>Configure</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Tickets</Text>
        {recent.map((t) => (
          <View key={t.id} style={styles.ticketRow}>
            <View style={styles.ticketLeft}>
              <Ticket color="#2196F3" size={20} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.ticketTitle}>{t.title}</Text>
                <Text style={styles.ticketMeta}>{t.id} · {t.priority}</Text>
              </View>
            </View>
            <View style={styles.ticketRight}>
              <Text style={[styles.badge, badgeColor(t.status)]}>{t.status}</Text>
              <View style={styles.timeRow}>
                <Clock color="#78909C" size={16} />
                <Text style={styles.timeText}>{t.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const badgeColor = (status: string) => {
  if (status === 'Open') return { backgroundColor: '#FFEBEE', color: '#d32f2f', borderColor: '#ffcdd2' }
  if (status === 'In Progress') return { backgroundColor: '#FFF8E1', color: '#ef6c00', borderColor: '#ffe0b2' }
  return { backgroundColor: '#E8F5E9', color: '#2e7d32', borderColor: '#c8e6c9' }
}

export default ManagerHome

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fafbfc',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#263238',
  },
  kpiLabel: {
    marginTop: 2,
    color: '#546E7A',
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    width: '32%'
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  ticketRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  ticketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketTitle: {
    fontWeight: '700',
    color: '#263238',
  },
  ticketMeta: {
    color: '#78909C',
    marginTop: 2,
  },
  ticketRight: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'none',
  } as any,
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    color: '#78909C',
    marginLeft: 6,
    fontSize: 12,
  },
})