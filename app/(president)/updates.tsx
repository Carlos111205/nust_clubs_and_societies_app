import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { type ClubUpdate } from '@/constants/data';
import { createUpdate, getClubUpdates, deleteUpdate } from '@/services/updates';
import { fetchClubByPresidentId } from '@/services/clubs';

export default function PresidentUpdatesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [clubId, setClubId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<ClubUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const club = await fetchClubByPresidentId(user.id);
    if (club) { setClubId(club.id); const data = await getClubUpdates(club.id); setUpdates(data); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handlePost = async () => {
    if (!title.trim()) { showAlert('Required', 'Please enter a title.'); return; }
    if (!content.trim()) { showAlert('Required', 'Please enter the post content.'); return; }
    if (!user || !clubId) return;
    setPosting(true);
    const { error } = await createUpdate(clubId, user.id, title.trim(), content.trim());
    if (error) { showAlert('Error', error); } else {
      setTitle(''); setContent(''); setComposing(false);
      showAlert('Posted!', 'Your update has been published to members.');
      await load();
    }
    setPosting(false);
  };

  const handleDelete = (update: ClubUpdate) => {
    showAlert('Delete Post', `Delete "${update.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUpdate(update.id); await load(); } },
    ]);
  };

  if (loading) return <View style={[styles.root, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Share with members</Text>
            <Text style={styles.headerTitle}>Club Updates</Text>
          </View>
          <Pressable onPress={() => setComposing(v => !v)} style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.85 }]}>
            <MaterialIcons name={composing ? 'close' : 'add'} size={22} color={Colors.textOnPrimary} />
            <Text style={styles.newBtnText}>{composing ? 'Cancel' : 'New Post'}</Text>
          </Pressable>
        </View>

        {composing && (
          <View style={styles.composeCard}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Post title..."
              placeholderTextColor={Colors.textMuted}
              style={styles.titleInput}
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share an update, announcement, or news with your club members..."
              placeholderTextColor={Colors.textMuted}
              style={styles.contentInput}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Pressable onPress={handlePost} disabled={posting} style={({ pressed }) => [styles.postBtn, pressed && { opacity: 0.85 }]}>
              {posting ? <ActivityIndicator color={Colors.textOnPrimary} /> : <><MaterialIcons name="send" size={18} color={Colors.textOnPrimary} /><Text style={styles.postBtnText}>Publish Update</Text></>}
            </Pressable>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />} contentContainerStyle={{ padding: Spacing.md }}>
          {updates.length === 0
            ? <View style={styles.empty}>
              <MaterialIcons name="campaign" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Posts Yet</Text>
              <Text style={styles.emptySub}>Create your first update to communicate with your members.</Text>
            </View>
            : updates.map(u => (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{u.title}</Text>
                    <Text style={styles.cardDate}>{new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                  </View>
                  <Pressable onPress={() => handleDelete(u)} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}>
                    <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                  </Pressable>
                </View>
                <Text style={styles.cardContent}>{u.content}</Text>
              </View>
            ))}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  newBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  composeCard: { margin: Spacing.md, backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '44', gap: Spacing.sm },
  titleInput: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.semibold, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  contentInput: { color: Colors.textPrimary, fontSize: FontSize.body, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, minHeight: 120 },
  postBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  postBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSize.body, fontWeight: FontWeight.bold, flex: 1, paddingRight: 8 },
  cardDate: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  cardContent: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },
  deleteBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingVertical: 64, gap: Spacing.sm },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
  emptySub: { color: Colors.textMuted, fontSize: FontSize.body, textAlign: 'center', lineHeight: 22 },
});
