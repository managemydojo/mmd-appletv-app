import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useStudentSettingsStore } from '../../../store/useStudentSettingsStore';

/**
 * Student Playback settings — autoplay toggles.
 *
 * Visual structure mirrors the Dojo Cast PlaybackSection so the two feel
 * consistent across the app.
 */
const PlaybackSection = () => {
  const {
    autoplayVideos,
    autoplaySound,
    forceSdrPlayback,
    toggleAutoplayVideos,
    toggleAutoplaySound,
    toggleForceSdrPlayback,
  } = useStudentSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playback</Text>

      {/* Autoplay videos toggle */}
      <FocusableCard
        onPress={toggleAutoplayVideos}
        style={styles.card}
        focusedStyle={styles.cardFocused}
        wrapperStyle={styles.cardWrapper}
        scaleOnFocus={false}
      >
        {() => (
          <View style={styles.cardInner}>
            <Text style={styles.cardLabel}>Autoplay videos</Text>
            <View
              style={[
                styles.toggle,
                autoplayVideos ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  autoplayVideos ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
            </View>
          </View>
        )}
      </FocusableCard>
      <Text style={styles.helperText}>
        Videos start playing automatically when highlighted.
      </Text>

      {/* Sound for autoplay toggle — disabled when autoplay is off */}
      <FocusableCard
        onPress={autoplayVideos ? toggleAutoplaySound : undefined}
        disabled={!autoplayVideos}
        style={[styles.card, !autoplayVideos && styles.cardDisabled]}
        focusedStyle={styles.cardFocused}
        wrapperStyle={styles.cardWrapper}
        scaleOnFocus={false}
      >
        {() => (
          <View style={styles.cardInner}>
            <Text
              style={[
                styles.cardLabel,
                !autoplayVideos && styles.cardLabelDisabled,
              ]}
            >
              Play with sound
            </Text>
            <View
              style={[
                styles.toggle,
                autoplaySound && autoplayVideos
                  ? styles.toggleOn
                  : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  autoplaySound && autoplayVideos
                    ? styles.toggleThumbOn
                    : styles.toggleThumbOff,
                ]}
              />
            </View>
          </View>
        )}
      </FocusableCard>
      <Text style={styles.helperText}>
        When autoplay is on, start playback with audio.
      </Text>

      {/* Force SDR Playback toggle */}
      <FocusableCard
        onPress={toggleForceSdrPlayback}
        style={styles.card}
        focusedStyle={styles.cardFocused}
        wrapperStyle={styles.cardWrapper}
        scaleOnFocus={false}
      >
        {() => (
          <View style={styles.cardInner}>
            <Text style={styles.cardLabel}>Force SDR Playback</Text>
            <View
              style={[
                styles.toggle,
                forceSdrPlayback ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  forceSdrPlayback
                    ? styles.toggleThumbOn
                    : styles.toggleThumbOff,
                ]}
              />
            </View>
          </View>
        )}
      </FocusableCard>
      <Text style={styles.helperText}>
        Disables HDR and Dolby Vision for video playback. Turn on if videos
        crash to the home screen on your TV.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(32),
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    paddingHorizontal: rs(28),
    paddingVertical: rs(24),
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardWrapper: {
    flex: 0,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: rs(28),
    color: '#FFFFFF',
  },
  cardLabelDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  toggle: {
    width: rs(60),
    height: rs(34),
    borderRadius: rs(17),
    justifyContent: 'center',
    paddingHorizontal: rs(4),
  },
  toggleOn: {
    backgroundColor: '#4A90E2',
  },
  toggleOff: {
    backgroundColor: '#374151',
  },
  toggleThumb: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: '#FFFFFF',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
    marginTop: rs(12),
    marginBottom: rs(36),
  },
});

export default PlaybackSection;
