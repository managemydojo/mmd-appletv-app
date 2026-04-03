import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { rs } from '../../theme/responsive';
import { format, parseISO, isValid } from 'date-fns';
import { stripHtml } from '../../utils/stripHtml';

type Nav = NativeStackNavigationProp<
  StudentStackParamList,
  'AnnouncementDetail'
>;
type Route = RouteProp<StudentStackParamList, 'AnnouncementDetail'>;

const safeFormatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const parsed = parseISO(dateString);
    if (isValid(parsed)) return format(parsed, 'MMM d, yyyy');
    const fallback = new Date(dateString);
    if (isValid(fallback)) return format(fallback, 'MMM d, yyyy');
    return dateString;
  } catch {
    return dateString;
  }
};

const AnnouncementDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { title, description, createdAt } = route.params;

  // Required on tvOS: without an explicit BackHandler that returns true,
  // the native UIKit layer captures Menu and exits the app instead of
  // popping this screen. The ScrollView below provides the focusable
  // UIScrollView element that makes this BackHandler fire.
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          hasTVPreferredFocus={true}
          onPress={() => navigation.goBack()}
          style={({ focused }) => [
            styles.headerContainer,
            focused && styles.headerFocused,
          ]}
        >
          <Text style={styles.headerTitle}>Announcements</Text>
        </Pressable>

        <Text style={styles.label}>Announcement Title</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{title}</Text>
        </View>

        <Text style={styles.label}>Message</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{stripHtml(description)}</Text>
        </View>

        <Text style={styles.label}>Date</Text>
        <View style={[styles.valueContainer, styles.dateContainer]}>
          <Text style={styles.valueText}>{safeFormatDate(createdAt)}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AnnouncementDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(60),
    paddingBottom: rs(60),
  },
  headerContainer: {
    marginTop: rs(30),
    marginBottom: rs(48),
    alignItems: 'center',
  },
  headerFocused: {
    opacity: 0.8,
  },
  headerTitle: {
    color: 'white',
    fontSize: rs(48),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    color: 'white',
    fontSize: rs(36),
    marginBottom: rs(16),
    fontWeight: '600',
  },
  valueContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: rs(28),
    paddingHorizontal: rs(28),
    marginBottom: rs(40),
    width: '100%',
  },
  dateContainer: {
    alignSelf: 'flex-start',
    minWidth: rs(260),
  },
  valueText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: rs(28),
  },
});
