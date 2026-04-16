import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { StudentStackParamList } from '../../navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserEmail, getUserFullName } from '../../utils/authHelpers';
import PlaybackSection from './settings/PlaybackSection';

type Nav = NativeStackNavigationProp<StudentStackParamList, 'Settings'>;

type TabId = 'Playback';
const TABS: TabId[] = ['Playback'];

const KARATE_BG =
  'https://images.unsplash.com/photo-1514050566906-8d077bae7046?w=1920&q=80';

const StudentSettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = React.useState<TabId>('Playback');
  const { logout } = useAuthStore();
  const accountEmail = useAuthStore(s => getUserEmail(s.user));
  const accountName = useAuthStore(s => getUserFullName(s.user));
  const showEmailRow = Boolean(accountEmail) && accountName !== accountEmail;

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Playback':
        return <PlaybackSection />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Settings</Text>
        <FocusableCard
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          focusedStyle={styles.backButtonFocused}
          wrapperStyle={styles.tabWrapper}
          scaleOnFocus={false}
        >
          {() => <Text style={styles.backButtonIcon}>{'\u2190'}</Text>}
        </FocusableCard>
      </View>
      <View style={styles.headerDivider} />

      <View style={styles.body}>
        {/* Left sidebar */}
        <View style={styles.sidebar}>
          {TABS.map(tab => (
            <FocusableCard
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              focusedStyle={styles.tabButtonFocused}
              wrapperStyle={styles.tabWrapper}
              scaleOnFocus={false}
            >
              {() => (
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              )}
            </FocusableCard>
          ))}

          {/* Account info + Logout at bottom */}
          <View style={styles.accountSection}>
            {accountName || accountEmail ? (
              <View style={styles.accountInfo}>
                {accountName ? (
                  <Text style={styles.accountName} numberOfLines={1}>
                    {accountName}
                  </Text>
                ) : null}
                {showEmailRow ? (
                  <Text style={styles.accountEmail} numberOfLines={1}>
                    {accountEmail}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <FocusableCard
              onPress={handleLogout}
              style={styles.logoutButton}
              focusedStyle={styles.logoutButtonFocused}
              wrapperStyle={styles.tabWrapper}
              scaleOnFocus={false}
            >
              {({ focused }) => (
                <Text
                  style={[
                    styles.logoutText,
                    focused && styles.logoutTextFocused,
                  ]}
                >
                  Logout
                </Text>
              )}
            </FocusableCard>
          </View>
        </View>

        {/* Right content panel */}
        <View style={styles.contentPanel}>
          <ImageBackground
            source={{ uri: KARATE_BG }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.contentOverlay} />
          <View style={styles.contentInner}>{renderContent()}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(48),
    paddingVertical: rs(28),
    backgroundColor: '#0C101E',
  },
  headerTitle: {
    fontSize: rs(42),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonFocused: {
    backgroundColor: '#4A90E2',
  },
  backButtonIcon: {
    fontSize: rs(32),
    color: '#FFFFFF',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '33%',
    backgroundColor: '#000000',
    paddingVertical: rs(48),
    paddingHorizontal: rs(32),
    justifyContent: 'flex-start',
    gap: rs(16),
  },
  tabWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4A90E2',
  },
  tabButtonFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  tabText: {
    fontSize: rs(30),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  accountSection: {
    marginTop: 'auto' as any,
    gap: rs(12),
  },
  accountInfo: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(16),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: rs(12),
    gap: rs(4),
  },
  accountName: {
    fontSize: rs(24),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: rs(20),
    color: 'rgba(255,255,255,0.5)',
  },
  logoutButton: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  logoutButtonFocused: {
    backgroundColor: '#DC3545',
    borderColor: '#DC3545',
    borderWidth: 2,
  },
  logoutText: {
    fontSize: rs(30),
    color: '#FF6B6B',
    fontWeight: '500',
  },
  logoutTextFocused: {
    color: '#FFFFFF',
  },
  contentPanel: {
    flex: 1,
    position: 'relative',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  contentInner: {
    flex: 1,
  },
});

export default StudentSettingsScreen;
