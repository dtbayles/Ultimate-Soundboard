import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SoundButton = ({ name, source }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFavoriteState();
  }, []);

  const loadFavoriteState = async () => {
    try {
      const favoriteState = await AsyncStorage.getItem(name);
      if (favoriteState !== null) {
        setIsFavorite(JSON.parse(favoriteState));
      }
    } catch (error) {
      console.log('Error loading favorite state:', error);
    }
  };

  const saveFavoriteState = async (value) => {
    try {
      await AsyncStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.log('Error saving favorite state:', error);
    }
  };

  const handleToggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    saveFavoriteState(newFavoriteState);
  };

  const handlePress = async () => {
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        const { sound: audioSound } = await Audio.Sound.createAsync(source);
        setSound(audioSound);
        audioSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis);
            setDuration(status.durationMillis);
          }
        });
        await audioSound.playAsync();
        setIsPlaying(true); // change to true to allow pausing
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async () => {
    try {
      if (sound !== null) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const localUri = FileSystem.documentDirectory + 'sound.mp3';
          await FileSystem.copyAsync({
            from: status.uri,
            to: localUri,
          });
          await Sharing.shareAsync(localUri);
        }
      } else {
        const { sound: audioSound } = await Audio.Sound.createAsync(source);
        const status = await audioSound.getStatusAsync();
        if (status.isLoaded) {
          const localUri = FileSystem.documentDirectory + 'sound.mp3';
          await FileSystem.copyAsync({
            from: status.uri,
            to: localUri,
          });
          await Sharing.shareAsync(localUri);
          await audioSound.unloadAsync(); // Unload the sound after sharing
        }
      }
    } catch (error) {
      console.log('Sharing error:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#f9f9f9',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 10,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexGrow: 1,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlButton: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: '#e6e6e6',
    },
    favoriteButton: {
      marginLeft: 10,
    },
    shareButton: {
      marginLeft: 10,
    },
    timeStamp: {
      marginTop: 5,
    },
    timeBarContainer: {
      width: '100%',
      height: 5,
      backgroundColor: '#ccc',
      borderRadius: 5,
      marginTop: 5,
    },
    currentTimeBar: {
      height: 5,
      backgroundColor: '#333',
      borderRadius: 5,
    },
    nameText: {
      width: 200,
      marginLeft: 10,
      flexShrink: 1,
    },
  });

  function convertToTimeStamp(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  return (
    <View style={styles.container}>
      <View style={styles.timeBarContainer}>
        <View
          style={[
            styles.currentTimeBar,
            { width: `${(currentTime / duration) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.timeStamp}>
        {convertToTimeStamp(currentTime)}/{convertToTimeStamp(duration)}
      </Text>
      <View style={styles.controlsContainer}>
        <View style={styles.leftContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePress}>
            {!isPlaying ? (
              <Ionicons name="ios-play" size={24} color="black" />
            ) : (
              <Ionicons name="ios-pause" size={24} color="black" />
            )}
          </TouchableOpacity>
          <Text style={styles.nameText} numberOfLines={20}>{name}</Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.favoriteButton]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'ios-heart' : 'ios-heart-outline'}
              size={24}
              color={isFavorite ? 'red' : 'black'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Ionicons name="ios-share" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SoundButton;