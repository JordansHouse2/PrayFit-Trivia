import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { pullAndMergeOnSignIn } from '@/lib/sync';

type Mode = 'sign-in' | 'sign-up';

export default function AccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'sign-up') {
        const { data, error: signUpError } = await signUpWithEmail(email.trim(), password);
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (!data.session) {
          // Email confirmation required before a session exists.
          setConfirmationSent(true);
          return;
        }
        await pullAndMergeOnSignIn(data.user!.id);
        router.back();
      } else {
        const { data, error: signInError } = await signInWithEmail(email.trim(), password);
        if (signInError) {
          setError(signInError.message);
          return;
        }
        await pullAndMergeOnSignIn(data.user.id);
        router.back();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText type="linkPrimary" themeColor="primary">
              ← Back
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Sync your streak and Bible progress across devices.
          </ThemedText>

          {confirmationSent ? (
            <ThemedView type="backgroundElement" style={styles.confirmCard}>
              <ThemedText type="default">Check your email</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                We sent a confirmation link to {email.trim()}. Once confirmed, come back and sign in.
              </ThemedText>
              <Pressable
                onPress={() => {
                  setConfirmationSent(false);
                  setMode('sign-in');
                }}>
                <ThemedText type="linkPrimary" themeColor="primary">
                  Back to sign in
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />

              {error && (
                <ThemedText type="small" themeColor="danger">
                  {error}
                </ThemedText>
              )}

              <Pressable
                onPress={submit}
                disabled={submitting}
                style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
                <ThemedText type="default" style={{ color: theme.onPrimary }}>
                  {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
                </ThemedText>
              </Pressable>

              <Pressable onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} style={styles.switchMode}>
                <ThemedText type="small" themeColor="textSecondary">
                  {mode === 'sign-in' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  switchMode: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  confirmCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
