import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { TVTextInput } from '../../components/ui/TVTextInput';
import { TVButton } from '../../components/ui/TVButton';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../validations/loginSchema';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import { AUTH_SCREEN_THEME as SCREEN_THEME } from '../../theme/authTheme';
import { AuthLayout } from '../../components/auth/AuthLayout';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { login, isLoading, apiError, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLocalError(null);
    clearError();
    try {
      await login(data.userName, data.password);
    } catch {
      // useAuthStore already writes a user-friendly message to `apiError`,
      // which the error UI below renders. Nothing else to do here — the
      // backend role drives routing on success, so no mismatch-redirect
      // logic is needed.
    }
  };

  return (
    <AuthLayout subtitle="Login to your Manage My Dojo account for access.">
      <View style={styles.cardContent}>
        {/* Username Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Username
          </Text>
          <Controller
            control={control}
            name="userName"
            render={({ field: { onChange, value } }) => (
              <TVTextInput
                value={value}
                onChangeText={onChange}
                placeholder=""
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="none"
                autoComplete="off"
                keyboardType="default"
                returnKeyType="next"
                style={styles.input}
                containerStyle={styles.inputContainer}
              />
            )}
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Password
          </Text>
          <View style={styles.passwordContainer}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                // NOTE: intentionally no `onSubmitEditing` — Sign In should
                // only fire when the user presses the Sign In button, not
                // when the keyboard "Done" key is tapped (tvOS UX preference).
                <TVTextInput
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  placeholder=""
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                  returnKeyType="done"
                  style={styles.input}
                  containerStyle={styles.inputContainer}
                  showVisibilityIcon={false}
                />
              )}
            />
          </View>
          {/* Error Message */}
          {(apiError || localError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{apiError || localError}</Text>
            </View>
          )}
        </View>

        {/* Bottom Row Actions */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomColLeft}>
            <FocusableCard
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordButton}
              focusedStyle={styles.forgotPasswordButtonFocused}
              wrapperStyle={styles.linkWrapper}
              scaleOnFocus={false}
            >
              {({ focused }) => (
                <Text
                  style={[
                    styles.forgotPasswordText,
                    focused && styles.forgotPasswordTextFocused,
                  ]}
                >
                  Forgot Password
                </Text>
              )}
            </FocusableCard>
          </View>

          <View style={styles.bottomColCenter}>
            <TVButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              style={styles.signInButton}
              textStyle={styles.signInButtonText}
            />
          </View>

          <View style={styles.bottomColRight}>
            <FocusableCard
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showButton}
              focusedStyle={styles.showButtonFocused}
              wrapperStyle={styles.linkWrapper}
              scaleOnFocus={false}
              accessible={true}
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              {() => (
                <Text style={styles.showButtonText}>
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </Text>
              )}
            </FocusableCard>
          </View>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    width: SCREEN_THEME.layout.cardContentWidth,
    gap: SCREEN_THEME.spacing.cardInnerGap,
    paddingTop: rs(60),
    paddingBottom: rs(80), // Generous bottom padding so the focused button's scale effect isn't clipped
  },
  inputGroup: {
    gap: SCREEN_THEME.spacing.cardInnerGap,
    width: '100%',
  },
  label: {
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    fontSize: SCREEN_THEME.typography.labelSize,
  },
  inputContainer: {
    height: SCREEN_THEME.layout.inputHeight,
    backgroundColor: SCREEN_THEME.colors.inputBg,
    borderRadius: SCREEN_THEME.layout.inputRadius,
    borderWidth: 1,
    borderColor: SCREEN_THEME.colors.borderColor,
  },
  input: {
    flex: 1,
    height: 'auto',
    fontSize: SCREEN_THEME.typography.labelSize,
    paddingHorizontal: rs(20),
    backgroundColor: 'transparent',
    color: '#FFFFFF', // Assuming white text for dark bg
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    height: SCREEN_THEME.layout.inputHeight,
    justifyContent: 'center',
  },
  showButton: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    borderRadius: rs(24),
    borderWidth: 2,
    borderColor: '#BFDBFE', // blue-200
    backgroundColor: 'transparent',
  },
  showButtonFocused: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74,144,226,0.15)',
    transform: [{ scale: 1.05 }],
  },
  showButtonText: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: SCREEN_THEME.typography.showTextSize,
    color: '#FFFFFF',
  },
  linkWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rs(50),
    width: '100%',
  },
  bottomColLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  bottomColCenter: {
    flex: 1,
    alignItems: 'center',
  },
  bottomColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  signInButton: {
    paddingHorizontal: rs(50),
    paddingVertical: rs(20),
    borderRadius: rs(20),
    borderWidth: 2,
    borderColor: '#BFDBFE', // blue-200
    backgroundColor: SCREEN_THEME.colors.blueButtonStart,
    width: undefined,
    // center alignment implied by justifyContent center
  },
  signInButtonText: {
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    fontSize: SCREEN_THEME.typography.buttonTextSize,
    color: '#FFFFFF',
  },
  forgotPasswordButton: {
    paddingVertical: rs(16),
    paddingHorizontal: rs(20),
    borderRadius: rs(12),
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  forgotPasswordButtonFocused: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74,144,226,0.15)',
    transform: [{ scale: 1.05 }],
  },
  forgotPasswordText: {
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    fontSize: SCREEN_THEME.typography.buttonTextSize,
    color: SCREEN_THEME.colors.forgotPasswordText,
    textAlign: 'center',
  },
  forgotPasswordTextFocused: {
    color: '#FFFFFF',
  },
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: rs(10), // Small spacer
  },
  errorText: {
    color: '#EF4444', // red-500
    fontSize: SCREEN_THEME.typography.labelSize,
    fontFamily: 'SF Pro Display',
    fontWeight: '500',
    textAlign: 'center',
  },
});
