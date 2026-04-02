import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Platform
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react-native';
import { colors, spacing, typography, radius, shadows } from '../Constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Toast = ({ visible, message, type = 'info', onHide }) => {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: insets.top + (spacing.md || 16),
                    useNativeDriver: true,
                    bounciness: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, insets.top]);

    if (!visible && opacity._value === 0) return null;

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: colors.success,
                    icon: <CheckCircle2 color={colors.white} size={20} />,
                };
            case 'error':
                return {
                    backgroundColor: colors.error,
                    icon: <XCircle color={colors.white} size={20} />,
                };
            case 'warning':
                return {
                    backgroundColor: colors.warning,
                    icon: <AlertCircle color={colors.white} size={20} />,
                };
            case 'info':
            default:
                return {
                    backgroundColor: colors.info,
                    icon: <Info color={colors.white} size={20} />,
                };
        }
    };

    const { backgroundColor, icon } = getToastStyle();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>{icon}</View>
                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
                <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                    <X color={colors.white} size={18} opacity={0.8} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: spacing.md,
        right: spacing.md,
        zIndex: 9999,
        padding: spacing.md,
        borderRadius: radius.lg,
        ...shadows.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    message: {
        ...typography.bodySmBold,
        color: colors.white,
        flex: 1,
    },
    closeButton: {
        marginLeft: spacing.sm,
        padding: 4,
    },
});

export default Toast;
