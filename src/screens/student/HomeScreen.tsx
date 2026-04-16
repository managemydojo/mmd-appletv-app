import React from 'react';
import { View, StyleSheet, ScrollView, TVFocusGuideView } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

// Components
import { HomeHeader } from '../../components/student/HomeHeader';
import { HeroSection } from '../../components/student/HeroSection';
import { HorizontalRow } from '../../components/ui/HorizontalRow';
import { ProgramCard } from '../../components/ui/ProgramCard';
import { TrainingAreaCard } from '../../components/ui/TrainingAreaCard';
// Data & Types
import { StudyCategory, StudyProgram } from '../../types/study';

import { useNavigation } from '@react-navigation/native';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useStudyStore } from '../../store/useStudyStore';
import { useWatchHistoryStore } from '../../store/useWatchHistoryStore';
import { StudyContentItem } from '../../types/study';
import { useVimeoThumbnails } from '../../hooks/useVimeoThumbnails';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    programs,
    trainingAreas,
    contentItems,
    loadingPrograms,
    loadingTrainingAreas,
    fetchCategories,
    fetchPrograms,
    fetchTrainingAreas,
  } = useStudyStore();
  const { history, loadHistory } = useWatchHistoryStore();
  useTheme();

  useExitConfirmation();

  React.useEffect(() => {
    // Fetch initially
    fetchCategories();
    fetchPrograms();
    fetchTrainingAreas();
    loadHistory();
  }, [fetchCategories, fetchPrograms, fetchTrainingAreas, loadHistory]);

  const recentlyWatched = React.useMemo(() => {
    if (!contentItems || contentItems.length === 0) return [];
    return history
      .map(h => contentItems.find(c => c._id === h.contentId))
      .filter(Boolean)
      .slice(0, 10) as StudyContentItem[];
  }, [history, contentItems]);

  // Fetch Vimeo thumbnails for items with no stripeImage
  const vimeoThumbnails = useVimeoThumbnails(recentlyWatched);

  // Hero item logic: most recent watched OR first available content
  const heroItem = React.useMemo(() => {
    if (recentlyWatched.length > 0) {
      return recentlyWatched[0];
    }
    return contentItems && contentItems.length > 0 ? contentItems[0] : null;
  }, [recentlyWatched, contentItems]);

  const handleProgramPress = (item: StudyProgram) => {
    navigation.navigate('ProgramDetail', { id: item._id, type: 'program' });
  };

  const handleTrainingAreaPress = (item: StudyCategory) => {
    navigation.navigate('ProgramDetail', { id: item._id, type: 'category' });
  };

  const handlePlayContent = (item: StudyContentItem) => {
    if (
      item?.contentLink &&
      (item.contentLink.includes('vimeo') ||
        item.contentLink.includes('mp4') ||
        item.contentLink.includes('m3u8'))
    ) {
      navigation.navigate('VideoPlayer', {
        videoUrl: item.contentLink,
        title: item.title,
        contentId: item._id,
      });
    }
  };

  const handleTabChange = (tab: 'Curriculum' | 'Announcements') => {
    if (tab === 'Announcements') {
      navigation.navigate('Announcements');
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky header — sits above the scroll content so it remains visible
           as the user scrolls down. Previously the header was overlaid on the
           hero inside the ScrollView, which hid it on scroll. */}
      <View style={styles.stickyHeader}>
        <HomeHeader onTabChange={handleTabChange} activeTab="Curriculum" />
      </View>

      {/* Curriculum View */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — no overlaid header now; sticky header sits above it */}
        <HeroSection
          title="Continue Watching"
          subtitle={heroItem ? heroItem.title : 'Start Learning'}
          progressText={heroItem?.category?.name || ''}
          videoUrl={heroItem?.contentLink}
          onContinuePress={() => heroItem && handlePlayContent(heroItem)}
        />

        <View style={styles.contentSection}>
          <TVFocusGuideView autoFocus>
            <HorizontalRow
              title="Programs"
              data={programs}
              loading={loadingPrograms}
              emptyMessage="No programs available"
              keyExtractor={(item: StudyProgram) => item._id}
              renderItem={({ item }: { item: StudyProgram }) => (
                <ProgramCard
                  title={item.name}
                  variant="text-only"
                  onPress={() => handleProgramPress(item)}
                />
              )}
            />
          </TVFocusGuideView>

          <TVFocusGuideView autoFocus>
            <HorizontalRow
              title="Training Area"
              data={trainingAreas}
              loading={loadingTrainingAreas}
              emptyMessage="No training areas available"
              keyExtractor={(item: StudyCategory) => item._id}
              renderItem={({ item }: { item: StudyCategory }) => (
                <TrainingAreaCard
                  title={item.name}
                  variant="text-only"
                  onPress={() => handleTrainingAreaPress(item)}
                />
              )}
            />
          </TVFocusGuideView>

          {recentlyWatched.length > 0 && (
            <TVFocusGuideView autoFocus>
              <HorizontalRow
                title="Recently Watched"
                data={recentlyWatched}
                keyExtractor={(item: StudyContentItem) => item._id}
                renderItem={({ item }: { item: StudyContentItem }) => {
                  const entry = history.find(h => h.contentId === item._id);
                  return (
                    <ProgramCard
                      title={item.title}
                      progress={entry?.progressPercent ?? 0}
                      previewUrl={item.contentLink}
                      image={{
                        uri:
                          vimeoThumbnails[item._id] ||
                          item.ranks?.[0]?.stripeImage ||
                          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                      }}
                      onPress={() => handlePlayContent(item)}
                    />
                  );
                }}
              />
            </TVFocusGuideView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  stickyHeader: {
    // Fixed at top above the ScrollView. The glass pill already has its own
    // dark translucent background so the hero image behind the ScrollView
    // remains readable underneath as it scrolls.
    width: '100%',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rs(50),
  },
  contentSection: {
    paddingTop: rs(20),
  },
});

export default HomeScreen;
