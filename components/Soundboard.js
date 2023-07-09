import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, View, TouchableOpacity, Text, TextInput, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Sound from './Sound';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_KEY, API_URL } from '@env';

const windowWidth = Dimensions.get('window').width;
const availableTags = ['golfing', 'tag2', 'tag3', 'tag4', 'tag5'];
const availableCategories = ['DJ Khaled', 'Vine', 'category3', 'category4', 'category5'];

const Soundboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [favoriteSounds, setFavoriteSounds] = useState([]);
  const [sounds, setSounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSounds();
    loadFavoriteSounds();
  }, []);

  const fetchSounds = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
      setSounds(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log('Error fetching sounds:', error);
      console.log('apiKey:', apiKey);
      setIsLoading(false);
    }
  };

  const loadFavoriteSounds = async () => {
    try {
      const favoriteSoundNames = await AsyncStorage.getAllKeys();
      const favoriteSounds = await AsyncStorage.multiGet(favoriteSoundNames);
      const parsedFavoriteSounds = favoriteSounds.map(([key, value]) => [key, JSON.parse(value)]);
      setFavoriteSounds(parsedFavoriteSounds);
    } catch (error) {
      console.log('Error loading favorite sounds:', error);
    }
  };

  const filteredSounds = sounds.filter((sound) => {
    const isMatchingSearch = sound.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isFavorite = sound.isFavorite === true || favoriteSounds.some(([name]) => name === sound.name);
    const hasMatchingTags = selectedTags.length === 0 || selectedTags.some((tag) => sound.tags.includes(tag));
    return (!showFavorites || isFavorite) && isMatchingSearch && hasMatchingTags;
  });

  const itemSize = (windowWidth - 20) / 3 - 10; // Calculate the item size dynamically

  const renderSoundItem = ({ item }) => {
    return (
      <View style={[styles.soundItemContainer, { width: itemSize, height: itemSize }]}>
        <Sound
          name={item.name}
          audio_source={item.audio_source}
          video_source={item.video_source}
          isFavorite={favoriteSounds.some(([name]) => name === item.name)}
        />
      </View>
    );
  };

  const toggleTagSelection = (tag) => {
    const isSelected = selectedTags.includes(tag);
    if (isSelected) {
      setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderTagItem = ({ item }) => {
    const isSelected = selectedTags.includes(item);

    return (
      <TouchableOpacity
        style={[styles.tagItem, isSelected ? styles.tagItemSelected : null]}
        onPress={() => toggleTagSelection(item)}
      >
        <Text style={styles.tagText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategorySounds = ({ item }) => {
    const soundsInCategory = filteredSounds.filter((sound) => sound.category === item);

    if (soundsInCategory.length === 0) {
      return null;
    }

    return (
      <View>
        <Text style={styles.categoryHeader}>{item}</Text>
        <FlatList
          data={soundsInCategory}
          renderItem={renderSoundItem}
          keyExtractor={(item) => item.name}
          numColumns={3}
          contentContainerStyle={styles.soundListContainer}
        />
      </View>
    );
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <View style={styles.soundBoard}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by sound name"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="filter" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => setShowFavorites(!showFavorites)}>
          <Text style={styles.favoriteButtonText}>{showFavorites ? 'All' : 'Favorites'}</Text>
        </TouchableOpacity>
      </View>
      {showMenu && (
        <View style={styles.menuContainer}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagTitle}>Tags:</Text>
            <FlatList
              data={availableTags}
              renderItem={renderTagItem}
              keyExtractor={(item) => item}
              numColumns={3}
              contentContainerStyle={styles.tagListContainer}
            />
          </View>
          <View style={styles.tagContainer}>
            <Text style={styles.tagTitle}>Categories:</Text>
            <FlatList
              data={availableCategories}
              renderItem={renderTagItem}
              keyExtractor={(item) => item}
              numColumns={3}
              contentContainerStyle={styles.tagListContainer}
            />
          </View>
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="black" style={styles.loadingIndicator} />
      ) : filteredSounds.length > 0 ? (
        <FlatList
          data={availableCategories}
          renderItem={renderCategorySounds}
          keyExtractor={(item) => item}
        />
      ) : (
        <Text style={styles.noSoundsText}>No sounds found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  soundBoard: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: 5,
  },
  soundItemContainer: {
    margin: 5,
    borderRadius: 10,
  },
  soundListContainer: {
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  favoriteButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'blue',
    minWidth: '20%',
    marginLeft: 10,
  },
  favoriteButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  noSoundsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: 'gray',
  },
  menuContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#f3f3f3',
    zIndex: 1,
    padding: 10,
    opacity: 0.8,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
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
  tagItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 14,
  },
  tagItemSelected: {
    backgroundColor: 'blue',
    borderColor: 'blue',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default Soundboard;
