import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { EchoStrength, VerseCandidate } from '@/types/content';

interface Props {
  candidate: VerseCandidate;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
  echoWord?: string;
  echoStrength?: EchoStrength;
}

export function VerseCandidateCard({ candidate, selected, locked, onPress, echoWord, echoStrength }: Props) {
  const theme = useTheme();

  let backgroundColor: string = theme.backgroundElement;
  let borderColor: string = theme.border;

  if (locked) {
    if (candidate.isCorrectClue) {
      backgroundColor = theme.successBackground;
      borderColor = theme.success;
    } else if (selected) {
      backgroundColor = theme.dangerBackground;
      borderColor = theme.danger;
    }
  } else if (selected) {
    backgroundColor = theme.backgroundSelected;
    borderColor = theme.primary;
  }

  return (
    <Pressable onPress={onPress} disabled={locked} style={[styles.card, { backgroundColor, borderColor }]}>
      <ThemedText type="smallBold">{candidate.reference}</ThemedText>
      <ThemedText type="default" style={styles.verseText}>
        "{candidate.text}"
      </ThemedText>
      {locked && candidate.isCorrectClue && (
        <View style={styles.explanation}>
          <ThemedText type="small" themeColor="success">
            {echoStrength === 'thematic'
              ? `This is the clue — thematic connection${echoWord ? ` to "${echoWord}"` : ''}.`
              : `This is the clue — it directly echoes "${echoWord}".`}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  verseText: {
    fontStyle: 'italic',
  },
  explanation: {
    marginTop: 4,
  },
});
