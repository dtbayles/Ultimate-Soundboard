import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, View, TouchableOpacity, Text, TextInput, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Sound from './Sound';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_KEY, API_URL } from '@env';
import * as FileSystem from 'expo-file-system';
import { useTheme } from "@react-navigation/native";
import FilterMenu from "./Soundboard/FilterMenu";
import InfiniteScroll from 'react-infinite-scroll-component';

const windowWidth = Dimensions.get('window').width;
const availableTags = ['golfing', 'tag2', 'tag3', 'tag4', 'tag5'];
const availableCategories = ['DJ Khaled', 'Vine', 'category3', 'category4', 'category5'];

const Soundboard = () => {
  const { colors } = useTheme();
  const [sounds, setSounds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [favoriteSounds, setFavoriteSounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSounds();
    loadFavoriteSounds();
  }, []);

  const fetchSounds = async () => {
    try {
      const response = await axios.get(API_URL + `?page=${currentPage}&pageSize=10`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
      const newSounds = response.data;

      // setSounds(response.data);
      setIsLoading(false);

      // Update the state with the new sounds and increment the page number
      setSounds((prevSounds) => [...prevSounds, ...newSounds]);
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.log('Error fetching sounds:', error);
      setIsLoading(false);
    }
  };

  // const fetchSounds = async () => {
  //   try {
  //     const response = await axios.get(`/sounds?page=${currentPage}&pageSize=10`);
  //     const newSounds = response.data;
  //
  //     // Update the state with the new sounds and increment the page number
  //     setSounds((prevSounds) => [...prevSounds, ...newSounds]);
  //     setCurrentPage((prevPage) => prevPage + 1);
  //   } catch (error) {
  //     console.log('Error fetching sounds:', error);
  //   }
  // };

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
          _id={item._id}
          name={item.name}
          audio_source={item.audio_source}
          video_source={item.video_source}
          play_count={item.play_count}
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
        <Text style={[styles.tagText, { color: colors.text }]}>{item}</Text>
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
        <Text style={[styles.categoryHeader, { color: colors.text }]}>{item}</Text>
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
    <View style={[styles.soundBoard, { backgroundColor: colors.background }]}>
      <View style={styles.filterContainer}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by sound name"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => setShowFavorites(!showFavorites)}>
          <Text style={styles.favoriteButtonText}>{showFavorites ? 'All' : 'Favorites'}</Text>
        </TouchableOpacity>
      </View>
      {showMenu && (
        <FilterMenu
          availableTags={availableTags}
          availableCategories={availableCategories}
          renderTagItem={renderTagItem}
          colors={colors}
          toggleTagSelection={toggleTagSelection}
        />
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.text} style={styles.loadingIndicator} />
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
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: 16,
    color: 'gray',
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
