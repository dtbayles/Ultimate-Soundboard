import React, {useState, useEffect, useRef} from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Audio, Video, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Sound = ({ name, audio_source, video_source }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const video = useRef(null);
  const [status, setStatus] = useState({});

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

  const handlePress = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        if (audio_source) {
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

  const handlePlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
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

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxHeight: '100%',
      maxWidth: '100%',
      paddingVertical: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      overflow: 'hidden',
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
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
      shadowColor: '#fff',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 5,
    },
    shareButton: {
      backgroundColor: 'transparent',
      padding: 10,
      shadowColor: '#fff',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 5,
    },
  });

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
          volume={0}
          useNativeControls={false}
          onPlaybackStatusUpdate={status => setStatus(status)}
        />
      )}
      <TouchableOpacity onPress={handlePress}>
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
      </TouchableOpacity>
    </View>
  );
};

export default Sound;
