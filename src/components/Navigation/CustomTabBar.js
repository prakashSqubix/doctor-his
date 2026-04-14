import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colorStrings from '../../Constants/AppColors';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const animationValues = useRef(state.routes.map(() => new Animated.Value(0))).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const marginHorizontal = 20;
  const containerWidth = width - (marginHorizontal * 2);
  const tabWidth = containerWidth / state.routes.length;

  useEffect(() => {
    // Animate the sliding indicator
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Animate the icons
    state.routes.forEach((_, index) => {
      Animated.spring(animationValues[index], {
        toValue: index === state.index ? 1 : 0,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index, tabWidth]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.container, { width: containerWidth }]}>
        <View style={styles.tabContent}>
          {/* Sliding Indicator Background */}
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidth - 20,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const scale = animationValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.2],
          });

          const translateY = animationValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5],
          });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [{ scale }, { translateY }],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {options.tabBarIcon({ focused: isFocused, color: isFocused ? colorStrings.clientColor : colorStrings.inactiveTextGrey, size: 24 })}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255,.9)',
    // backgroundColor: '#FFFFFF33',
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  tabContent: {
    flexDirection: 'row',
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    height: 45,
    // backgroundColor: colorStrings.clientColor + '20', // Glassy primary tint
    borderRadius: 22.5,
    left: 10,
    zIndex: 1,
  },
});

export default CustomTabBar;
