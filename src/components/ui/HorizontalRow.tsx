import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface HorizontalRowProps {
  title: string;
  data: any[];
  /**
   * Renders one card. Receives `item`, `index`, and `cardRef`. Callers should
   * attach `cardRef` to the rendered card at `index === 0` so HomeScreen can
   * target it as a `nextFocusUp` destination from the row below.
   */
  renderItem: ({
    item,
    index,
    cardRef,
  }: {
    item: any;
    index: number;
    cardRef?: React.Ref<any>;
  }) => React.ReactElement;
  keyExtractor: (item: any) => string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  emptyMessage?: string;
  /**
   * External ref to the first card (index 0). Consumers pass this so the
   * card can be used as a `nextFocusUp` target for cards in the row below.
   */
  firstCardRef?: React.MutableRefObject<any>;
}

export const HorizontalRow: React.FC<HorizontalRowProps> = ({
  title,
  data,
  renderItem,
  keyExtractor,
  contentContainerStyle,
  loading = false,
  emptyMessage = 'No content available',
  firstCardRef,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontSize: theme.fontSize.h3 },
          ]}
        >
          {title}
        </Text>
        <View style={styles.placeholderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontSize: theme.fontSize.h3 },
          ]}
        >
          {title}
        </Text>
        <View style={styles.placeholderContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, fontSize: theme.fontSize.h3 },
        ]}
      >
        {title}
      </Text>

      <FlatList
        horizontal
        data={data}
        renderItem={({ item, index }) =>
          renderItem({
            item,
            index,
            // Only the first card receives the external ref — LEFT-edge case.
            cardRef: index === 0 ? firstCardRef : undefined,
          })
        }
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        removeClippedSubviews={false} // Prevent focus issues on TV
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    width: '100%',
    position: 'relative',
  },
  title: {
    fontWeight: '700',
    marginBottom: 20,
    marginLeft: 60, // Align with content padding
  },
  listContent: {
    paddingHorizontal: 60,
    gap: 24,
  },
  placeholderContainer: {
    height: rs(180),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: rs(22),
  },
});
