import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl, SectionList
} from 'react-native';
import Sound from './Sound';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_KEY, API_URL } from '@env';
import * as FileSystem from 'expo-file-system';
import { useTheme } from "@react-navigation/native";
import FilterMenu from "./Soundboard/FilterMenu";
import {DATA, testSounds} from "./utils";

const windowWidth = Dimensions.get('window').width;
const availableTags = ['golfing', 'tag2', 'tag3', 'tag4', 'tag5'];
const availableCategories = ['DJ Khaled', 'Vine', 'Zombies'];

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
  const [hasMorePages, setHasMorePages] = useState(true);
  const [lastFetchedPage, setLastFetchedPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // loadSoundsFromStorage();
    loadFavoriteSounds();
    fetchSounds();
  }, []);

  // const loadSoundsFromStorage = async () => {
  //   try {
  //     const soundFiles = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
  //     const storedSounds = [];
  //
  //     for (const file of soundFiles) {
  //       const fileUri = `${FileSystem.cacheDirectory}${encodeURIComponent(file)}`;
  //       const soundData = await FileSystem.getInfoAsync(`file://${fileUri}`);
  //
  //       // Load the sound metadata from storage
  //       const metadataKey = `sound_metadata_${file}`;
  //       const metadataString = await AsyncStorage.getItem(metadataKey);
  //       const metadata = JSON.parse(metadataString);
  //
  //       if (metadata) {
  //         const sound = {
  //           name: metadata.name,
  //           audio_source: soundData.uri,
  //           video_source: metadata.video_source,
  //           _id: metadata._id,
  //           view_count: metadata.view_count,
  //           // Include other relevant metadata properties
  //         };
  //         storedSounds.push(sound);
  //       }
  //     }
  //
  //     setSounds(storedSounds);
  //   } catch (error) {
  //     console.log('Error loading sounds from storage:', error);
  //   }
  // };

  // Check if there are sounds already loaded from the last fetched page
  // useEffect(() => {
  //   if (sounds.length === 0 && lastFetchedPage > 0) {
  //     setCurrentPage(lastFetchedPage + 1);
  //   }
  // }, [sounds, lastFetchedPage]);

  const fetchSounds = async () => {
    if (!hasMorePages || isFetching) {
      console.log('No more pages to fetch or already fetching');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsFetching(true); // Set the flag to indicate that a fetch is in progress
      console.log('Fetching page:', currentPage);
      const response = await axios.get(API_URL + `?page=${currentPage}&pageSize=20`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
      const { sounds, hasMorePages } = response.data;
      setIsLoading(false);
      console.log('Has more pages:', hasMorePages)
      // Update the state with the new sounds and increment the page number
      setSounds((prevSounds) => [...prevSounds, ...sounds]);
      setCurrentPage((prevPage) => prevPage + 1);
      setHasMorePages(hasMorePages);

      // Set the last fetched page
      // setLastFetchedPage(currentPage);
    } catch (error) {
      console.log('Error fetching sounds:', error);
      setIsLoading(false);
    } finally {
      setIsFetching(false); // Reset the flag after the fetch is completed
    }
  };


  // const downloadSound = async (sound) => {
  //   const audioFileUri = FileSystem.cacheDirectory + encodeURIComponent(`${sound.name}.mp3`);
  //   const audioDownloadResumable = FileSystem.createDownloadResumable(sound.audio_source, audioFileUri, {});
  //
  //   try {
  //     const [{ uri: audioUri }] = await Promise.all([
  //       audioDownloadResumable.downloadAsync(),
  //     ]);
  //
  //     sound.audio_source = audioUri;
  //
  //     // Download and assign video source if it exists
  //     if (sound.video_source) {
  //       const videoFileUri = FileSystem.cacheDirectory + encodeURIComponent(`${sound.name}.mp4`);
  //       const videoDownloadResumable = FileSystem.createDownloadResumable(sound.video_source, videoFileUri, {});
  //       const { uri: videoUri } = await videoDownloadResumable.downloadAsync();
  //       sound.video_source = videoUri;
  //     }
  //
  //     // Store the sound metadata in AsyncStorage
  //     const metadataKey = `sound_metadata_${sound.name}`;
  //     const metadata = {
  //       name: sound.name,
  //       video_source: sound.video_source,
  //       _id: sound._id,
  //       view_count: sound.view_count,
  //       // Include other relevant metadata properties
  //     };
  //     await AsyncStorage.setItem(metadataKey, JSON.stringify(metadata));
  //
  //     // Set the updated sound object in state
  //     setSounds((prevSounds) => [...prevSounds, sound]);
  //   } catch (error) {
  //     console.log(`Error downloading sound: ${sound.name}`, error);
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

  // const renderSoundItem = ({ item, index }) => {
  //   // Check if the current item is one of the first three items in its category
  //   const isFirstItemInCategory = index < 3 || sounds[index - 1].category !== item.category;
  //
  //   return (
  //     <View>
  //       <View>
  //         {isFirstItemInCategory && (
  //           <Text style={[styles.categoryHeader, { color: colors.text, backgroundColor: 'orange' }]}>{item.category}</Text>
  //         )}
  //       </View>
  //       <View style={[styles.soundItemContainer, { width: itemSize, height: itemSize }]}>
  //         <Sound
  //           _id={item._id}
  //           name={item.name}
  //           audio_source={item.audio_source}
  //           video_source={item.video_source}
  //           play_count={item.play_count}
  //           isFavorite={favoriteSounds.some(([name]) => name === item.name)}
  //         />
  //       </View>
  //     </View>
  //   );
  // };

  const renderSoundItem = ({ item }) => (
    <View style={[styles.soundItemContainer, { width: itemSize, height: itemSize }]}>
      <Sound
        _id={item._id}
        name={item.name}
        audio_source={item.audio_source}
        video_source={item.video_source}
        play_count={item.play_count}
        isFavorite={favoriteSounds.some(([name]) => name === item.name)}
        colors={colors}
      />
    </View>
  );

  const renderSectionHeader = ({ section: { category } }) => (
    <Text style={[styles.categoryHeader, { color: colors.text }]}>
      {category}
    </Text>
  );


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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const formatData = () => {
    const formattedData = [];

    filteredSounds.forEach((sound, index) => {
      const sectionIndex = formattedData.findIndex((section) => section.category === sound.category);

      if (sectionIndex === -1) {
        // If the category doesn't exist, create a new section with the category and add the sound to it
        formattedData.push({
          category: sound.category,
          data: [sound],
        });
      } else {
        // If the category exists, add the sound to the existing section
        formattedData[sectionIndex].data.push(sound);
      }
    });

    return formattedData;
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
        <ActivityIndicator size="small" color={colors.text} />
      ) : filteredSounds.length > 0 ? (
        <SectionList
          sections={formatData()}
          renderItem={renderSoundItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => item.name + index}
          contentContainerStyle={styles.soundListContainer}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchSounds} />}
          stickySectionHeadersEnabled={true}
          onEndReached={fetchSounds}
          onEndReachedThreshold={10}
          ListFooterComponent={<ActivityIndicator size="small" color={colors.text} />}
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
    flex: 1,
    margin: 5,
    borderRadius: 10,
  },
  soundListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  categoryHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    minWidth: '100%',
  },
});

export default Soundboard;
