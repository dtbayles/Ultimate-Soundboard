import React from 'react';
import { FlatList, Text, View } from 'react-native';
import {rgbToRGBA} from "../utils";

const FilterMenu = ({
  availableTags,
  availableCategories,
  renderTagItem,
  colors,
}) => {

  const styles = {
    menuContainer: {
      position: 'absolute',
      top: 55,
      left: 0,
      right: 0,
      zIndex: 1,
      padding: 10,
      borderBottomColor: 'gray',
      borderBottomWidth: 1,
      shadowOffset: { width: 0, height: 2 },
      backgroundColor: rgbToRGBA(colors.background, 0.9),
    },
    tagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginBottom: 5,
    },
    tagTitle: {
      marginRight: 5,
      fontWeight: 'bold',
    },
    tagListContainer: {
      marginBottom: 10,
    },
  };

  return (
    <View style={styles.menuContainer}>
      <View style={styles.tagContainer}>
        <Text style={[styles.tagTitle, { color: colors.text }]}>Tags:</Text>
        <FlatList
          data={availableTags}
          renderItem={renderTagItem}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.tagListContainer}
        />
      </View>
      <View style={styles.tagContainer}>
        <Text style={[styles.tagTitle, { color: colors.text }]}>Categories:</Text>
        <FlatList
          data={availableCategories}
          renderItem={renderTagItem}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.tagListContainer}
        />
      </View>
    </View>
  );
};

export default FilterMenu;
