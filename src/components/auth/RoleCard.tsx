import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableCard } from '../ui/FocusableCard';
import { rs } from '../../theme/responsive';
import { SvgProps } from 'react-native-svg';

// ─── Figma Inspector Values ──────────────────────────────────────
const CARD_THEME = {
  layout: {
    width: rs(539),
    height: rs(476),
    borderRadius: rs(30),
    borderWidthDefault: rs(1),
    borderWidthFocused: rs(8),
  },
  icon: {
    size: rs(384),
  },
  typography: {
    labelSize: rs(60),
  },
  colors: {
    cardFill: '#020617',
    borderDefault: '#FFFFFF',
    borderFocused: '#93C5FD',
    text: '#F8FAFC',
  },
} as const;

interface RoleCardProps {
  title: string;
  Icon: React.FC<SvgProps>;
  onPress: () => void;
  /** When true, the card is grayed out, non-focusable, and shows a "Coming Soon" badge */
  disabled?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  title,
  Icon,
  onPress,
  disabled = false,
}) => {
  return (
    <View style={disabled ? styles.disabledWrapper : undefined}>
      <FocusableCard
        onPress={disabled ? undefined : onPress}
        // `focusable={false}` prevents Apple TV / Android TV remote from
        // placing focus on this card entirely when it is disabled
        focusable={!disabled}
        style={[
          styles.card,
          {
            backgroundColor: CARD_THEME.colors.cardFill,
            borderColor: disabled
              ? 'rgba(255,255,255,0.15)'
              : CARD_THEME.colors.borderDefault,
            borderWidth: CARD_THEME.layout.borderWidthDefault,
          },
        ]}
        focusedStyle={
          disabled
            ? undefined
            : {
                borderColor: CARD_THEME.colors.borderFocused,
                borderWidth: CARD_THEME.layout.borderWidthFocused,
                backgroundColor: CARD_THEME.colors.cardFill,
                zIndex: 10,
              }
        }
        scaleOnFocus={!disabled}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon width={CARD_THEME.icon.size} height={CARD_THEME.icon.size} />
          </View>
          <Text
            style={[
              styles.title,
              {
                color: disabled
                  ? 'rgba(248,250,252,0.3)'
                  : CARD_THEME.colors.text,
                fontSize: CARD_THEME.typography.labelSize,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        {/* Coming Soon badge — shown only on disabled cards */}
        {disabled && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </FocusableCard>
    </View>
  );
};

const styles = StyleSheet.create({
  disabledWrapper: {
    opacity: 0.35,
  },
  card: {
    width: CARD_THEME.layout.width,
    height: CARD_THEME.layout.height,
    borderRadius: CARD_THEME.layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
    paddingBottom: rs(40),
  },
  iconContainer: {
    marginBottom: rs(20),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontFamily: 'SF Compact',
    fontWeight: '400',
    textAlign: 'center',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: rs(20),
    right: rs(20),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(20),
    paddingHorizontal: rs(20),
    paddingVertical: rs(8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: rs(22),
    fontWeight: '500',
  },
});
