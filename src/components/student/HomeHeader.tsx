import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TVFocusGuideView,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchIcon from '../../../assets/icons/search-icon.svg';
import Logo from '../../../assets/icons/logo.svg';

interface HomeHeaderProps {
  onTabChange?: (tab: 'Curriculum' | 'Announcements') => void;
  activeTab?: 'Curriculum' | 'Announcements';
  /** Optional refs so parents can target tabs from below (UP into header). */
  curriculumTabRef?: React.Ref<any>;
  announcementsTabRef?: React.Ref<any>;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onTabChange,
  activeTab = 'Curriculum',
  curriculumTabRef,
  announcementsTabRef,
}) => {
  const { theme } = useTheme();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<Record<string, object | undefined>>
    >();
  const route = useRoute();

  const [focusedTab, setFocusedTab] = React.useState<
    'Curriculum' | 'Announcements' | null
  >(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [settingsFocused, setSettingsFocused] = React.useState(false);

  // Each tab has its own driver. 0 = underline hidden (transparent +
  // collapsed), 1 = underline showing (full color + full width). The
  // value drives BOTH opacity and scaleX so the underline appears to
  // grow from the center as it fades in.
  //
  // useState with a lazy initializer is used (not useRef) so the
  // Animated.Value is constructed exactly once on mount. With useRef
  // the `new Animated.Value(...)` expression runs every render and
  // throws the result away — wasted allocations.
  const [curriculumUnderline] = React.useState(
    () => new Animated.Value(activeTab === 'Curriculum' ? 1 : 0),
  );
  const [announcementsUnderline] = React.useState(
    () => new Animated.Value(activeTab === 'Announcements' ? 1 : 0),
  );

  React.useEffect(() => {
    Animated.timing(curriculumUnderline, {
      toValue:
        activeTab === 'Curriculum' || focusedTab === 'Curriculum' ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(announcementsUnderline, {
      toValue:
        activeTab === 'Announcements' || focusedTab === 'Announcements' ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [activeTab, focusedTab, curriculumUnderline, announcementsUnderline]);

  const handleSearchPress = () => {
    if (route.name === 'Search') {
      navigation.goBack();
    } else {
      navigation.navigate('Search');
    }
  };

  const handleTabPress = (tab: 'Curriculum' | 'Announcements') => {
    if (onTabChange) onTabChange(tab);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  /**
   * Render a tab. Text is always full white — no dimming. Underline
   * color tells the rest of the story:
   *   - focused (cursor is here)        -> white
   *   - active and not focused          -> primary blue
   *   - idle inactive                   -> transparent (still rendered
   *                                        to keep tab height stable)
   *
   * No background tint, no border ring. Underline is a child View at
   * the bottom of the tab so its color can flip independent of the
   * tab's own bare treatment.
   */
  const renderTab = (
    label: 'Curriculum' | 'Announcements',
    tabRef: React.Ref<any> | undefined,
    driver: Animated.Value,
  ) => {
    const isActive = activeTab === label;
    const isFocused = focusedTab === label;
    const underlineColor = isFocused
      ? theme.colors.text
      : isActive
      ? theme.colors.primary
      : 'transparent';

    return (
      <TouchableOpacity
        ref={tabRef}
        onPress={() => handleTabPress(label)}
        onFocus={() => setFocusedTab(label)}
        onBlur={() => setFocusedTab(prev => (prev === label ? null : prev))}
        // TouchableOpacity defaults to activeOpacity=0.2 which dims the
        // children during press AND on some tvOS focus paths. Force it
        // to 1 so the text stays at full white in every state.
        activeOpacity={1}
        style={styles.tab}
      >
        <Text style={styles.tabText}>{label}</Text>
        <Animated.View
          style={[
            styles.underline,
            {
              backgroundColor: underlineColor,
              opacity: driver,
              transform: [{ scaleX: driver }],
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  const isSearchFocused = searchFocused || route.name === 'Search';

  return (
    <TVFocusGuideView autoFocus style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Brand mark — non-interactive */}
        <View style={styles.logoContainer} accessibilityElementsHidden>
          <Logo width={rs(56)} height={rs(56)} />
        </View>

        {/* Search — standalone, no pill. White-outline focus to match
            the rest of the app's focus language. */}
        <TouchableOpacity
          onPress={handleSearchPress}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          activeOpacity={1}
          style={[
            styles.searchButton,
            isSearchFocused && styles.searchButtonFocused,
          ]}
        >
          <SearchIcon width={rs(28)} height={rs(28)} color="white" />
        </TouchableOpacity>

        {/* Tabs */}
        {renderTab('Curriculum', curriculumTabRef, curriculumUnderline)}
        {renderTab(
          'Announcements',
          announcementsTabRef,
          announcementsUnderline,
        )}

        {/* Spacer pushes settings to the far right */}
        <View style={{ flex: 1 }} />

        {/* Settings — white-outline focus, matches search and the
            DojoCastSetup focus language. */}
        <TouchableOpacity
          onPress={handleSettingsPress}
          onFocus={() => setSettingsFocused(true)}
          onBlur={() => setSettingsFocused(false)}
          activeOpacity={1}
          style={[
            styles.settingsBtn,
            settingsFocused && styles.settingsBtnFocused,
          ]}
          accessibilityLabel="Settings"
        >
          <Text
            style={[
              styles.settingsIcon,
              settingsFocused && { color: theme.colors.text },
            ]}
          >
            {'⚙'}
          </Text>
        </TouchableOpacity>
      </View>
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: rs(40),
    paddingHorizontal: rs(60),
    paddingBottom: rs(24),
    zIndex: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(28),
  },
  logoContainer: {
    width: rs(64),
    height: rs(64),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Search button: constant 3px transparent border so the swap to a
  // white border on focus doesn't shift layout by 1-2 pixels.
  searchButton: {
    width: rs(50),
    height: rs(50),
    borderRadius: rs(25),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  searchButtonFocused: {
    borderColor: '#FFFFFF',
  },
  // Tabs are text + an underline strip. No background, no border ring.
  // Focus and active both show up as a white underline.
  tab: {
    paddingVertical: rs(10),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // All tabs share the same weight + color. Active vs inactive is
  // shown ONLY via the underline color — the text itself never dims,
  // never thins, never changes between states.
  tabText: {
    fontSize: rs(24),
    paddingVertical: rs(2),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  underline: {
    // Constant height keeps the tab's outer dimensions fixed whether
    // the underline is colored or transparent.
    height: rs(3),
    width: '100%',
    marginTop: rs(4),
    borderRadius: rs(2),
  },
  // Settings button: same constant-border-width discipline as search.
  settingsBtn: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderWidth: 3,
    borderColor: 'transparent',
    flexShrink: 0,
  },
  settingsBtnFocused: {
    borderColor: '#FFFFFF',
  },
  settingsIcon: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: rs(32),
  },
});
