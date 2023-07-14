import React, {useState, useEffect, useRef} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio, Video, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from "@react-navigation/native";
import {clearCacheDirectory, rgbToRGBA} from "./utils";
import axios from "axios";
import { API_KEY, API_URL } from '@env';

const Sound = ({ _id, name, audio_source, video_source, play_count, colors }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [playCount, setPlayCount] = useState(play_count); // Initialize playCount with the initial play_count value
  const styles = componentStyles(colors);

  useEffect(() => {
    loadFavoriteState();
    return () => {
      if (sound !== null) {
        sound.unloadAsync();
      }
    };
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

  const incrementPlayCount = async () => {
    const requestURL = `${API_URL}/${_id}/playcount`;
    try {
      await axios.put(requestURL, null, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
      setPlayCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.log('Error incrementing play count:', error);
    }
  };

  const handlePress = async () => {
    // clearCacheDirectory(audio_source);
    // console.log('audio_source', audio_source);
    // console.log('video_source', video_source);
    try {
      incrementPlayCount();
      if (sound) {
        if (isPlaying) {
          await sound.stopAsync(); // Stop the currently playing sound
          await sound.playAsync(); // Start playing the sound from the beginning
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } else {
        if (video_source) {
          await video.current.replayAsync(); // Replay the video from the beginning
          setIsPlaying(true);
        } else if (audio_source) {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: InterruptionModeIOS.DuckOthers,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          });
          const audioSound = new Audio.Sound();
          await audioSound.loadAsync({ uri: audio_source });
          await audioSound.playAsync();
          setSound(audioSound);
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.log('video_source', video_source);
      console.log('audio_source', audio_source);
      console.log('Playback error:', error);
    }
  };

  const handleShare = async () => {
    try {
      const localUri = FileSystem.documentDirectory + 'audio.mp3';
      const { exists } = await FileSystem.getInfoAsync(localUri);

      if (exists) {
        await Sharing.shareAsync(localUri);
      } else {
        const { uri } = await FileSystem.downloadAsync(
          audio_source || video_source,
          localUri
        );
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.log('Sharing error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {video_source && (
        <View style={styles.backgroundOverlay} />
      )}
      {video_source && (
        <Video
          source={{ uri: video_source }}
          ref={video}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isPlaying}
          useNativeControls={false}
          onPlaybackStatusUpdate={status => setStatus(status)}
        />
      )}
      <TouchableOpacity style={styles.touchableContainer} onPress={handlePress}>
        <Text style={styles.nameText} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'ios-heart' : 'ios-heart-outline'}
              size={24}
              color={isFavorite ? 'red' : 'black'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="ios-share" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.playCountText} numberOfLines={1}>
          <Ionicons name="md-eye" size={14} color={colors.text} />
          {playCount}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const componentStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    // maxHeight: '100%',
    // maxWidth: '100%',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: rgbToRGBA(colors.text, 0.3),
    borderRadius: 10,
    // shadowColor: '#000',
    // shadowColor: colors.text,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    overflow: 'hidden',
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 10,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backgroundColor: rgbToRGBA(colors.background, 0.75),
  },
  nameText: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  favoriteButton: {
    backgroundColor: 'transparent',
    padding: 10,
    // shadowColor: '#fff',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 1,
    // shadowRadius: 6,
    // elevation: 5,
  },
  shareButton: {
    backgroundColor: 'transparent',
    padding: 10,
    // shadowColor: '#fff',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 1,
    // shadowRadius: 6,
    // elevation: 5,
  },
  playCountText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    // paddingLeft: 10,
    marginLeft: 10,
    marginRight: 'auto',
    // backgroundColor: rgbToRGBA(colors.background, 0.75),
    // textShadowColor: 'rgba(0, 0, 0, 0.5)', // Adjust the shadow color if needed
    textShadowColor: rgbToRGBA(colors.background, 0.75), // Adjust the shadow color if needed
    textShadowOffset: { width: 1, height: 1 }, // Adjust the shadow offset if needed
    textShadowRadius: 2, // Adjust the shadow radius if needed
  }
});

export default Sound;
