import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { router, useRootNavigationState, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdmin } from '../context/AdminContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type Session = {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  reviewStatus: string;
  reviewNotes?: string;
  meetingLink?: string;
  interviewerName?: string;
  rescheduleCount?: number;
  createdAt: string;
};

type Stats = {
  totalSessions: number;
  scheduled: number;
  completed: number;
  underReview: number;
  approved: number;
  rejected: number;
  totalInterviewers: number;
};

type Tab = 'all' | 'scheduled' | 'completed' | 'approved';

export default function AdminDashboardScreen() {
  const { admin, logout, isLoading } = useAdmin();
  const rootNavigationState = useRootNavigationState();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);
  const [meetInput, setMeetInput] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [sRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/sessions`),
        fetch(`${BACKEND_URL}/api/admin/stats`),
      ]);
      const sData = await sRes.json();
      const statsData = await statsRes.json();
      if (sData.success) setSessions(sData.sessions || []);
      if (statsData.success) setStats(statsData.stats || null);
    } catch (e) {
      console.error('Load error:', e);
      Alert.alert('Error', 'Could not load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      loadData();
      // Setup live polling every 10 seconds
      const interval = setInterval(() => {
        loadData(true); // pass true for silent background refresh
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filtered = sessions.filter((s) => {
    if (tab === 'all') return true;
    if (tab === 'scheduled') return s.status === 'scheduled' || s.status === 'rescheduled';
    if (tab === 'completed') return s.status === 'completed' && s.reviewStatus === 'under_review';
    if (tab === 'approved') return s.reviewStatus === 'approved';
    return true;
  });

  const openSession = (s: Session) => {
    setSelected(s);
    setMeetInput(s.meetingLink || '');
    setReviewNotes(s.reviewNotes || '');
  };

  const closeModal = () => {
    setSelected(null);
    setMeetInput('');
    setReviewNotes('');
  };

  const attachMeetLink = async () => {
    if (!selected) return;
    if (!meetInput.trim()) {
      Alert.alert('Missing link', 'Please enter a Google Meet URL.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/sessions/${selected._id}/meeting-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingLink: meetInput.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        Alert.alert('Saved', 'Meeting link attached successfully.');
        await loadData();
        closeModal();
      } else {
        Alert.alert('Failed', result.message || 'Could not save link');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sessions/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: selected._id }),
      });
      const result = await res.json();
      if (result.success) {
        Alert.alert('Updated', 'Session marked as completed. Now under review.');
        await loadData();
        closeModal();
      } else {
        Alert.alert('Failed', result.message || 'Could not update');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async (reviewStatus: 'approved' | 'rejected') => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/sessions/${selected._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus, reviewNotes: reviewNotes.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        Alert.alert('Done', `Profile ${reviewStatus}.`);
        await loadData();
        closeModal();
      } else {
        Alert.alert('Failed', result.message || 'Could not save review');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/admin/login');
        },
      },
    ]);
  };

  const openMeet = (link: string) => {
    Linking.openURL(link).catch(() => Alert.alert('Error', 'Could not open link'));
  };

  const prettyDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusColor = (s: Session) => {
    if (s.reviewStatus === 'approved') return COLORS.success;
    if (s.reviewStatus === 'rejected') return COLORS.error;
    if (s.status === 'completed' || s.reviewStatus === 'under_review') return '#F59E0B';
    if (s.status === 'scheduled' || s.status === 'rescheduled') return COLORS.primary;
    return COLORS.textSecondary;
  };

  const statusLabel = (s: Session) => {
    if (s.reviewStatus === 'approved') return 'APPROVED';
    if (s.reviewStatus === 'rejected') return 'REJECTED';
    if (s.reviewStatus === 'under_review') return 'UNDER REVIEW';
    if (s.status === 'rescheduled') return 'RESCHEDULED';
    if (s.status === 'cancelled') return 'CANCELLED';
    if (s.status === 'completed') return 'COMPLETED';
    return s.status.toUpperCase();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading auth…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!admin) {
    return <Redirect href="/admin/login" />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>{admin?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            <StatCard label="Total" value={stats.totalSessions} color={COLORS.primary} />
            <StatCard label="Scheduled" value={stats.scheduled} color="#3B82F6" />
            <StatCard label="Review" value={stats.underReview} color="#F59E0B" />
            <StatCard label="Approved" value={stats.approved} color={COLORS.success} />
          </View>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'completed', label: 'Under Review' },
              { key: 'approved', label: 'Approved' },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sessions list */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No sessions here</Text>
            <Text style={styles.emptyText}>Pull down to refresh</Text>
          </View>
        ) : (
          filtered.map((s) => (
            <TouchableOpacity
              key={s._id}
              style={styles.sessionCard}
              onPress={() => openSession(s)}
              activeOpacity={0.85}
            >
              <View style={styles.sessionTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{s.userName || 'Unnamed user'}</Text>
                  <Text style={styles.userPhone}>{s.userId}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(s) + '18', borderColor: statusColor(s) + '40' }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor(s) }]}>{statusLabel(s)}</Text>
                </View>
              </View>

              <View style={styles.sessionMeta}>
                <Text style={styles.metaText}>📅 {prettyDate(s.scheduledDate)}</Text>
                <Text style={styles.metaText}>⏰ {s.scheduledTime}</Text>
              </View>

              {s.meetingLink ? (
                <View style={styles.meetRow}>
                  <Text style={styles.meetBadge}>🔗 Meet link attached</Text>
                </View>
              ) : (
                s.status === 'scheduled' || s.status === 'rescheduled' ? (
                  <View style={styles.meetRowAction}>
                    <Text style={styles.meetBadgePending}>⚠️ Meet link not attached</Text>
                  </View>
                ) : null
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Session Details Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {selected && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selected.userName || 'User'}</Text>
                      <Text style={styles.modalPhone}>{selected.userId}</Text>
                    </View>
                    <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                      <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalSummary}>
                    <Text style={styles.summaryLine}>
                      📅 {prettyDate(selected.scheduledDate)} · ⏰ {selected.scheduledTime}
                    </Text>
                    <Text style={styles.summaryLine}>Status: {statusLabel(selected)}</Text>
                    {selected.rescheduleCount ? (
                      <Text style={styles.summaryLine}>🔁 Rescheduled {selected.rescheduleCount} time(s)</Text>
                    ) : null}
                  </View>

                  {/* Meeting link section */}
                  <Text style={styles.sectionLabel}>Google Meet Link</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    placeholderTextColor={COLORS.textSecondary}
                    value={meetInput}
                    onChangeText={setMeetInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.primaryAction]}
                      onPress={attachMeetLink}
                      disabled={saving}
                    >
                      <Text style={styles.primaryActionText}>
                        {selected.meetingLink ? 'Update Link' : 'Attach Link'}
                      </Text>
                    </TouchableOpacity>
                    {selected.meetingLink ? (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.outlineAction]}
                        onPress={() => openMeet(selected.meetingLink!)}
                      >
                        <Text style={styles.outlineActionText}>Open</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Mark completed */}
                  {(selected.status === 'scheduled' || selected.status === 'rescheduled') && (
                    <>
                      <Text style={styles.sectionLabel}>Session Status</Text>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.warningAction]}
                        onPress={markCompleted}
                        disabled={saving}
                      >
                        <Text style={styles.warningActionText}>Mark as Completed (move to Review)</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Review actions */}
                  {(selected.reviewStatus === 'under_review' ||
                    selected.reviewStatus === 'approved' ||
                    selected.reviewStatus === 'rejected') && (
                    <>
                      <Text style={styles.sectionLabel}>Profile Review</Text>
                      <TextInput
                        style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                        placeholder="Optional notes for the user..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={reviewNotes}
                        onChangeText={setReviewNotes}
                        multiline
                      />
                      <View style={styles.row}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.successAction]}
                          onPress={() => submitReview('approved')}
                          disabled={saving}
                        >
                          <Text style={styles.successActionText}>✓ Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.dangerAction]}
                          onPress={() => submitReview('rejected')}
                          disabled={saving}
                        >
                          <Text style={styles.dangerActionText}>✕ Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {saving && (
                    <View style={styles.savingOverlay}>
                      <ActivityIndicator color={COLORS.primary} />
                    </View>
                  )}

                  <View style={{ height: SPACING.xl }} />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  headerSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logoutText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '600' },

  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },

  statsRow: { flexDirection: 'row', marginBottom: SPACING.lg, gap: SPACING.sm as any },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },

  tabsScroll: { flexGrow: 0, marginBottom: SPACING.md },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: SPACING.sm,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.caption, color: COLORS.text, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },

  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
  emptyText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4 },

  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userName: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
  userPhone: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  sessionMeta: { flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.md as any },
  metaText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginRight: SPACING.md },

  meetRow: { marginTop: SPACING.sm },
  meetRowAction: { marginTop: SPACING.sm },
  meetBadge: { ...TYPOGRAPHY.caption, color: COLORS.success, fontWeight: '600' },
  meetBadgePending: { ...TYPOGRAPHY.caption, color: '#F59E0B', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  modalPhone: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, color: COLORS.textSecondary },

  modalSummary: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  summaryLine: { ...TYPOGRAPHY.body, color: COLORS.text, marginBottom: 4 },

  sectionLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  row: { flexDirection: 'row', gap: SPACING.sm as any, marginTop: SPACING.xs },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  primaryAction: { backgroundColor: COLORS.primary },
  primaryActionText: { ...TYPOGRAPHY.button, color: COLORS.white },
  outlineAction: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  outlineActionText: { ...TYPOGRAPHY.button, color: COLORS.primary },
  warningAction: { backgroundColor: '#F59E0B', marginHorizontal: 0 },
  warningActionText: { ...TYPOGRAPHY.button, color: COLORS.white },
  successAction: { backgroundColor: COLORS.success },
  successActionText: { ...TYPOGRAPHY.button, color: COLORS.white },
  dangerAction: { backgroundColor: COLORS.error },
  dangerActionText: { ...TYPOGRAPHY.button, color: COLORS.white },

  savingOverlay: { alignItems: 'center', paddingVertical: SPACING.md },
});
