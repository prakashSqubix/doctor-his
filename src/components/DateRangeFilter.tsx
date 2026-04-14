import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../Constants/theme';

const theme = {
  colors: {
    ...colors,
    text: {
      primary: colors.text,
      secondary: colors.textSecondary
    },
    background: colors.gray100
  },
  typography: {
    fontFamily: undefined
  }
};

// --- Helper Utilities ---
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatShortDate = (date: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const subMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

interface DateRangeFilterProps {
  onApply: (fromDate: Date, toDate: Date, filterType: string) => void;
  initialFromDate?: Date;
  initialToDate?: Date;
  initialFilterType?: string;
  allowedFilters?: Array<'7d' | '1m' | '3m' | 'today' | 'yesterday' | 'tomorrow' | 'custom'>;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onApply,
  initialFromDate,
  initialToDate,
  initialFilterType = '1m',
  allowedFilters = ['7d', '1m', '3m', 'custom'],
}) => {
  const styles = getStyles();

  const [activeFilter, setActiveFilter] = useState<string>(initialFilterType);
  const [fromDate, setFromDate] = useState<Date>(initialFromDate || subMonths(new Date(), 1));
  const [toDate, setToDate] = useState<Date>(initialToDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState<{ show: boolean; mode: 'from' | 'to' }>({ show: false, mode: 'from' });

  const handleQuickFilter = (filter: string) => {
    setActiveFilter(filter);
    let end = new Date();
    let start = new Date();

    if (filter === '7d') start = subDays(end, 7);
    else if (filter === '1m') start = subMonths(end, 1);
    else if (filter === '3m') start = subMonths(end, 3);
    else if (filter === 'yesterday') {
      start = subDays(end, 1);
      end = subDays(new Date(), 1);
    }
    else if (filter === 'tomorrow') {
      start = subDays(end, -1);
      end = subDays(new Date(), -1);
    }
    // 'today' is handled implicitly by start and end defaulting to new Date()

    setFromDate(start);
    setToDate(end);
    onApply(start, end, filter);
  };

  const handleCustomDateSelect = (dateString: string) => {
    // Parse manually to avoid UTC offset issues:
    const [year, month, day] = dateString.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);

    if (showDatePicker.mode === 'from') {
      setFromDate(selectedDate);
      if (selectedDate > toDate) {
        setToDate(selectedDate);
      }
      setShowDatePicker({ show: true, mode: 'to' });
    } else {
      setToDate(selectedDate);
      if (selectedDate < fromDate) {
        setFromDate(selectedDate);
      }
      setActiveFilter('custom');
      // DO NOT close showDatePicker automatically. Let the user tap "Apply Filter".
    }
  };

  const getMarkedDates = (from: Date, to: Date) => {
    const marked: any = {};
    const fromStr = formatDate(from);
    const toStr = formatDate(to);

    if (fromStr === toStr) {
      marked[fromStr] = {
        startingDay: true,
        endingDay: true,
        selected: true,
        color: theme.colors.primary,
        textColor: '#FFF'
      };
      return marked;
    }

    marked[fromStr] = {
      startingDay: true,
      selected: true,
      color: theme.colors.primary,
      textColor: '#FFF'
    };

    let curr = new Date(from);
    curr.setDate(curr.getDate() + 1);
    while (curr < to && formatDate(curr) !== toStr) {
      marked[formatDate(curr)] = {
        selected: true,
        color: theme.colors.primary,
        textColor: '#FFF'
      };
      curr.setDate(curr.getDate() + 1);
    }

    marked[toStr] = {
      endingDay: true,
      selected: true,
      color: theme.colors.primary,
      textColor: '#FFF'
    };

    return marked;
  };

  const FilterChip = ({ label, active, onPress }: any) => (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.activeFilterChip]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {allowedFilters.map((filter: string) => {
          if (filter === 'custom') {
            return (
              <TouchableOpacity
                key="custom"
                style={[styles.filterChip, activeFilter === 'custom' && styles.activeFilterChip]}
                onPress={() => setShowDatePicker({ show: true, mode: 'from' })}
              >
                <CalendarIcon size={14} color={activeFilter === 'custom' ? '#FFF' : theme.colors.text.secondary} />
                <Text style={[styles.filterChipText, activeFilter === 'custom' && styles.activeFilterChipText, { marginLeft: 6 }]}>
                  {activeFilter === 'custom' ? `${formatShortDate(fromDate)} - ${formatShortDate(toDate)}` : 'Custom'}
                </Text>
              </TouchableOpacity>
            );
          }

          const labels: Record<string, string> = {
            '7d': 'Last 7 Days',
            '1m': '1 Month',
            '3m': '3 Months',
            'today': 'Today',
            'yesterday': 'Yesterday',
            'tomorrow': 'Tomorrow'
          };

          return (
            <FilterChip
              key={filter}
              label={labels[filter]}
              active={activeFilter === filter}
              onPress={() => handleQuickFilter(filter)}
            />
          );
        })}
      </ScrollView>

      <Modal
        visible={showDatePicker.show}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker({ ...showDatePicker, show: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker.mode === 'from' ? 'Select Start Date' : 'Select End Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, show: false })}>
                <X size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <View style={styles.dateTabs}>
                <TouchableOpacity
                  style={[styles.dateTab, showDatePicker.mode === 'from' && styles.activeDateTab]}
                  onPress={() => setShowDatePicker({ show: true, mode: 'from' })}
                >
                  <Text style={[styles.dateTabText, showDatePicker.mode === 'from' && styles.activeDateTabText]}>
                    From: {formatDisplayDate(fromDate)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateTab, showDatePicker.mode === 'to' && styles.activeDateTab]}
                  onPress={() => setShowDatePicker({ show: true, mode: 'to' })}
                >
                  <Text style={[styles.dateTabText, showDatePicker.mode === 'to' && styles.activeDateTabText]}>
                    To: {formatDisplayDate(toDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <Calendar
                current={formatDate(showDatePicker.mode === 'from' ? fromDate : toDate)}
                maxDate={formatDate(new Date())}
                onDayPress={(day: any) => handleCustomDateSelect(day.dateString)}
                showSixWeeks={true}
                markingType="period"
                theme={{
                  selectedDayBackgroundColor: theme.colors.primary,
                  todayTextColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                  textDayFontFamily: theme.typography.fontFamily,
                  textMonthFontFamily: theme.typography.fontFamily,
                  textDayHeaderFontFamily: theme.typography.fontFamily,
                }}
                markedDates={getMarkedDates(fromDate, toDate)}
              />

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  if (showDatePicker.mode === 'from') {
                    setShowDatePicker({ show: true, mode: 'to' });
                  } else {
                    setShowDatePicker({ show: false, mode: 'to' });
                    setActiveFilter('custom');
                    onApply(fromDate, toDate, 'custom');
                  }
                }}
              >
                <Text style={styles.applyBtnText}>
                  {showDatePicker.mode === 'from' ? 'Next: Select End Date' : 'Apply Filter'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  dateTabs: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    padding: 4,
  },
  dateTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeDateTab: {
    backgroundColor: theme.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateTabText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
  },
  activeDateTabText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  applyBtn: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily,
  },
});

export default DateRangeFilter;
