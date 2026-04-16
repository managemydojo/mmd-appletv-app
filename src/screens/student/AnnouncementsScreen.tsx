import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { HomeHeader } from '../../components/student/HomeHeader';
import { AnnouncementsView } from '../../components/student/AnnouncementsView';
import { StudentStackParamList } from '../../navigation';

type Nav = NativeStackNavigationProp<StudentStackParamList, 'Announcements'>;

const AnnouncementsScreen = () => {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

  const handleTabChange = (tab: 'Curriculum' | 'Announcements') => {
    if (tab === 'Curriculum') {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader onTabChange={handleTabChange} activeTab="Announcements" />
      <View style={styles.content}>
        <AnnouncementsView />
      </View>
    </View>
  );
};

export default AnnouncementsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
