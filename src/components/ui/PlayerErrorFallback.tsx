import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../theme/responsive';
import { FocusableCard } from './FocusableCard';

interface PlayerErrorFallbackProps {
  onTryAgain: () => void;
  onGoBack: () => void;
}

/**
 * Fallback rendered by ErrorBoundary when the video player throws.
 * Two focusable buttons — Try Again clears the boundary so the player
 * remounts, Go Back pops the navigator outright.
 */
export const PlayerErrorFallback: React.FC<PlayerErrorFallbackProps> = ({
  onTryAgain,
  onGoBack,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playback failed.</Text>
      <Text style={styles.message}>We couldn't play this video.</Text>
      <View style={styles.row}>
        <FocusableCard
          onPress={onTryAgain}
          hasTVPreferredFocus={true}
          style={styles.button}
          focusedStyle={styles.buttonFocused}
          wrapperStyle={styles.buttonWrapper}
          scaleOnFocus={true}
        >
          {() => <Text style={styles.buttonText}>Try Again</Text>}
        </FocusableCard>
        <FocusableCard
          onPress={onGoBack}
          style={styles.buttonOutline}
          focusedStyle={styles.buttonOutlineFocused}
          wrapperStyle={styles.buttonWrapper}
          scaleOnFocus={true}
        >
          {() => <Text style={styles.buttonText}>Go Back</Text>}
        </FocusableCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(60),
  },
  title: {
    fontSize: rs(44),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: rs(12),
  },
  message: {
    fontSize: rs(24),
    color: 'rgba(255,255,255,0.7)',
    marginBottom: rs(36),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: rs(20),
  },
  buttonWrapper: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: rs(40),
    paddingVertical: rs(14),
    borderRadius: rs(12),
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  buttonFocused: {
    borderColor: '#FFFFFF',
  },
  buttonOutline: {
    paddingHorizontal: rs(40),
    paddingVertical: rs(14),
    borderRadius: rs(12),
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  buttonOutlineFocused: {
    borderColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: rs(22),
    fontWeight: '600',
  },
});
