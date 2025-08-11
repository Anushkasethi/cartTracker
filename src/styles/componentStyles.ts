import { StyleSheet } from 'react-native';
import { colors, spacing } from './globalStyles';

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  secondary: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  success: {
    backgroundColor: '#28a745', // Green success color
  },
  disabled: {
    backgroundColor: '#cccccc',
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  highlight: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export const statusStyles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: spacing.md,
    borderRadius: 8,
    borderColor: colors.error,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: spacing.md,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
  },
});

export const authStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleContainer: {
    marginBottom: spacing.sm,
  },
  subtitleContainer: {
    textAlign: 'center',
  },
  phoneSection: {
    marginBottom: spacing.lg,
  },
  phoneLabel: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  phoneInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: colors.primary,
  },
  phoneInputText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  termsText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
