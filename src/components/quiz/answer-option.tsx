import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  label: string;
  selected: boolean;
  locked: boolean;
  isCorrectAnswer: boolean;
  onPress: () => void;
}

export function AnswerOption({ label, selected, locked, isCorrectAnswer, onPress }: Props) {
  const theme = useTheme();

  let backgroundColor: string = theme.backgroundElement;
  let borderColor: string = theme.border;
  let textColor: string = theme.text;

  if (locked) {
    if (isCorrectAnswer) {
      backgroundColor = theme.successBackground;
      borderColor = theme.success;
      textColor = theme.success;
    } else if (selected) {
      backgroundColor = theme.dangerBackground;
      borderColor = theme.danger;
      textColor = theme.danger;
    }
  } else if (selected) {
    backgroundColor = theme.backgroundSelected;
    borderColor = theme.primary;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      style={[styles.option, { backgroundColor, borderColor }]}>
      <ThemedText type="default" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
