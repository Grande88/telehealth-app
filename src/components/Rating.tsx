import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface RatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  onRatingChange,
  size = 20,
  readOnly = true,
}) => {
  return (
    <View style={styles.container}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <TouchableOpacity
            key={index}
            disabled={readOnly}
            onPress={() => onRatingChange && onRatingChange(starValue)}
            style={styles.starContainer}
          >
            <Star
              size={size}
              color={isFilled ? colors.warning : colors.outlineVariant}
              fill={isFilled ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginRight: spacing.xs,
  },
});
