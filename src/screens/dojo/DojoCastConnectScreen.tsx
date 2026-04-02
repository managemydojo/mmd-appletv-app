import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useDojoCastStore } from '../../store/useDojoCastStore';
import { DojoStackParamList } from '../../navigation';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { useDojoCastSlides } from '../../hooks/useDojoCastSlides';
import FileIcon from '../../../assets/icons/file.svg';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Connect'>;

const DojoCastConnectScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const setConnectionStatus = useDojoCastStore(s => s.setConnectionStatus);
  const { data: slidesResponse, isLoading } = useDojoCastSlides();

  const slides = slidesResponse?.data?.items ?? [];

  useExitConfirmation();

  const handleSelectSlides = () => {
    setConnectionStatus('connected');
    navigation.navigate('Setup');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Title */}
      <Text style={styles.mainTitle}>Dojo Cast</Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Connect Google Slides
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        Choose the Google Slides presentation you'd like to display on your dojo
        screen .{'\n'}This presentation will be shown during classes,
        announcements, and events using{'\n'}your dojo's email account.
      </Text>
      <Text style={[styles.description, { marginTop: rs(8) }]}>
        You can change or manage the connected presentation at any time
      </Text>

      {/* Loading indicator */}
      {isLoading && (
        <Text style={[styles.description, { marginTop: rs(16) }]}>
          Loading slides...
        </Text>
      )}

      {/* Available slides count */}
      {slides.length > 0 && (
        <Text style={[styles.description, { marginTop: rs(16) }]}>
          {slides.length} presentation{slides.length !== 1 ? 's' : ''} available
        </Text>
      )}

      {/* Select Google Slides Button */}
      <FocusableCard
        onPress={handleSelectSlides}
        style={styles.selectButton}
        focusedStyle={styles.selectButtonFocused}
        wrapperStyle={{ flex: 0 }}
        scaleOnFocus={true}
      >
        {() => (
          <View style={styles.selectButtonInner}>
            <FileIcon width={rs(28)} height={rs(28)} />
            <Text style={styles.selectButtonText}>Select Google Slides</Text>
          </View>
        )}
      </FocusableCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  mainTitle: {
    fontSize: rs(96),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: rs(16),
  },
  subtitle: {
    fontSize: rs(36),
    fontWeight: '600',
    marginBottom: rs(48),
  },
  description: {
    fontSize: rs(26),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: rs(38),
  },
  selectButton: {
    marginTop: rs(48),
    backgroundColor: '#4A7FD4',
    borderRadius: rs(16),
    paddingVertical: rs(18),
    paddingHorizontal: rs(40),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectButtonFocused: {
    backgroundColor: '#5A8FE4',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  selectButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  slidesIconContainer: {
    width: rs(28),
    height: rs(28),
  },
  selectButtonText: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DojoCastConnectScreen;
