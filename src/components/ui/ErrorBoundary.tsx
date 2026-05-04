import React, { Component, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
  /**
   * Custom fallback UI. When provided, replaces the default error
   * screen. Receives a `reset` callback that clears the error state
   * (and runs `onReset` if supplied).
   */
  fallback?: (reset: () => void) => React.ReactNode;
  /**
   * Optional side effect to run when the user dismisses the error —
   * e.g. `() => navigation.goBack()`. Runs AFTER the boundary clears
   * its hasError state.
   */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary — catches unhandled JS errors in the React tree and
 * shows a user-friendly fallback screen instead of a blank/white screen.
 *
 * On TV, long-pressing the remote Menu/Home button is the standard
 * "restart" gesture, but we also provide a Retry button.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: When Sentry is set up, log here:
    // Sentry.captureException(error, { extra: info });
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleRestart = () => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.handleRestart);
      }
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app ran into an unexpected error. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRestart}
            hasTVPreferredFocus
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 40,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
});
