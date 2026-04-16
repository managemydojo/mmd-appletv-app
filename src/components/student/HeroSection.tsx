import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';
import BackgroundImage from '../../../assets/images/student-background.png';
import Video from 'react-native-video';
import {
  resolveVimeoUrl,
  fetchVimeoThumbnail,
} from '../../utils/resolveVimeoUrl';
import { useStudentSettingsStore } from '../../store/useStudentSettingsStore';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  progressText: string;
  image?: ImageSourcePropType | string;
  /** Vimeo/direct URL — used to auto-resolve thumbnail and play preview on button focus */
  videoUrl?: string;
  onContinuePress: () => void;
  withBackground?: boolean;
}

const PREVIEW_DELAY_MS = 600;

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  progressText,
  image,
  videoUrl,
  onContinuePress,
  withBackground = true,
}) => {
  const { theme } = useTheme();
  const autoplayVideos = useStudentSettingsStore(s => s.autoplayVideos);
  const autoplaySound = useStudentSettingsStore(s => s.autoplaySound);
  const [isFocused, setIsFocused] = useState(false);
  const [resolvedThumb, setResolvedThumb] = useState<string | null>(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch Vimeo thumbnail when videoUrl changes
  useEffect(() => {
    if (!videoUrl) return;
    fetchVimeoThumbnail(videoUrl).then(thumb => {
      if (thumb && isMounted.current) {
        setResolvedThumb(thumb);
      }
    });
  }, [videoUrl]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Respect the student's autoplay preference — if disabled, never trigger
    // the hover-to-play preview.
    if (videoUrl && autoplayVideos) {
      previewTimer.current = setTimeout(async () => {
        let previewUrl = resolvedVideoUrl;
        if (!previewUrl) {
          previewUrl = await resolveVimeoUrl(videoUrl);
          if (previewUrl && isMounted.current) {
            setResolvedVideoUrl(previewUrl);
          }
        }
        if (previewUrl && isMounted.current) {
          setShowPreview(true);
        }
      }, PREVIEW_DELAY_MS);
    }
  }, [videoUrl, resolvedVideoUrl, autoplayVideos]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
    setShowPreview(false);
  }, []);

  // Resolve image source: Vimeo thumbnail > passed image > static background
  const imageSource: ImageSourcePropType = resolvedThumb
    ? { uri: resolvedThumb }
    : typeof image === 'string'
    ? { uri: image }
    : image || BackgroundImage;

  const content = (
    <>
      {/* Hover-to-play preview video. Muted flag respects the student's
           "Play with sound" setting. */}
      {showPreview && resolvedVideoUrl && (
        <Video
          source={{ uri: resolvedVideoUrl }}
          style={StyleSheet.absoluteFillObject}
          muted={!autoplaySound}
          repeat={true}
          resizeMode="cover"
          controls={false}
        />
      )}

      <View style={styles.contentOverlay}>
        {/* Info Column - Left Side */}
        <View style={styles.infoContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.progressText}>{progressText}</Text>

          <TouchableOpacity
            onPress={onContinuePress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary },
              isFocused && styles.buttonFocused,
            ]}
          >
            <Text style={styles.buttonText}>Continue Training</Text>
          </TouchableOpacity>

          <Text style={styles.restartLink}>Restart Learning</Text>
        </View>

        {/* Play Button - hidden during preview */}
        {!showPreview && (
          <View style={styles.playButtonContainer} pointerEvents="none">
            <PlayButton width={rs(120)} height={rs(120)} />
          </View>
        )}
      </View>

      {/* Gradient Overlay for text readability */}
      <View style={styles.gradientOverlay} />
    </>
  );

  if (withBackground) {
    return (
      <ImageBackground
        source={imageSource}
        style={styles.container}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        {content}
      </ImageBackground>
    );
  }

  // withBackground=false — show thumbnail (or static BG) ourselves
  return (
    <ImageBackground
      source={imageSource}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {content}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: rs(600),
    marginBottom: rs(40),
    justifyContent: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  backgroundImage: {},
  contentOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(60),
    paddingTop: rs(120),
    zIndex: 2,
    position: 'relative',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: rs(40),
    zIndex: 3,
  },
  playButtonContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -rs(60) }, { translateY: -rs(60) }],
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  headerTitle: {
    fontSize: rs(56),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: rs(12),
  },
  subtitle: {
    fontSize: rs(28),
    color: 'rgba(255,255,255,0.95)',
    marginBottom: rs(12),
  },
  progressText: {
    fontSize: rs(22),
    color: 'rgba(255,255,255,0.7)',
    marginBottom: rs(30),
  },
  button: {
    paddingVertical: rs(18),
    paddingHorizontal: rs(40),
    borderRadius: rs(12),
    alignSelf: 'flex-start',
    marginBottom: rs(20),
    borderWidth: 4,
    borderColor: 'transparent',
  },
  buttonFocused: {
    borderColor: 'white',
    transform: [{ scale: 1.05 }],
  },
  buttonText: {
    color: 'white',
    fontSize: rs(26),
    fontWeight: 'bold',
  },
  restartLink: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: rs(20),
  },
});
