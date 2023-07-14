import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';

export const rgbToRGBA = (rgb, alpha) => {
  const r = parseInt(rgb.substring(rgb.indexOf('(') + 1, rgb.indexOf(',')));
  const g = parseInt(rgb.substring(rgb.indexOf(',') + 1, rgb.lastIndexOf(',')));
  const b = parseInt(rgb.substring(rgb.lastIndexOf(',') + 1, rgb.indexOf(')')));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Log the contents of AsyncStorage
export const logAsyncStorageContents = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    const contents = items.map(([key, value]) => ({ [key]: value }));
    console.log('AsyncStorage contents:', contents);
  } catch (error) {
    console.log('Error logging AsyncStorage contents:', error);
  }
};

export const viewFileSystem = async (directory) => {
  try {
    const info = await FileSystem.getInfoAsync(directory);
    console.log('Directory info:', info);

    if (info.isDirectory) {
      const files = await FileSystem.readDirectoryAsync(directory);
      console.log('Files:', files);
    } else {
      const fileContent = await FileSystem.readAsStringAsync(directory);
      console.log('File content:', fileContent);
    }
  } catch (error) {
    console.log('Error viewing file system:', error);
  }
};

export const clearCacheDirectory = async (localUri) => {
  try {
    const cacheDirectory = FileSystem.cacheDirectory;
    const files = await FileSystem.readDirectoryAsync(cacheDirectory);
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    // const deletePromises = files.map(async (file) => {
    //   await FileSystem.deleteAsync(`${cacheDirectory}${file}`, { idempotent: true });
    // });
    // await Promise.all(deletePromises);
    console.log('Cache directory cleared successfully.');
  } catch (error) {
    console.log('Error clearing cache directory:', error);
  }
};

export const testSounds =
  {
    "sounds": [
      {
        "category": "DJ Khaled",
        "data": [
          {
            "_id": "64aee32ad5b8f4fc61f5f8b3",
            "name": "Let's Go Swimming DELETE 2",
            "audio_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp3",
            "tags": [
              "dj khaled",
              "swimming"
            ],
            "category": "DJ Khaled",
            "play_count": 2,
            "video_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp4",
            "createdAt": "2023-07-12T17:30:18.396Z",
            "updatedAt": "2023-07-13T22:23:18.527Z",
            "__v": 0
          },
          {
            "_id": "2",
            "name": "Let's Go Swimming DELETE 2",
            "audio_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp3",
            "tags": [
              "dj khaled",
              "swimming"
            ],
            "category": "DJ Khaled",
            "play_count": 2,
            "video_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-golfing.mp4",
            "createdAt": "2023-07-12T17:30:18.396Z",
            "updatedAt": "2023-07-13T22:23:18.527Z",
            "__v": 0
          },
          {
            "_id": "3",
            "name": "Let's Go Swimming DELETE 2",
            "audio_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp3",
            "tags": [
              "dj khaled",
              "swimming"
            ],
            "category": "DJ Khaled",
            "play_count": 2,
            "video_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp4",
            "createdAt": "2023-07-12T17:30:18.396Z",
            "updatedAt": "2023-07-13T22:23:18.527Z",
            "__v": 0
          },
        ],
      },
      {
        "category": "Vine",
        "data": [
          {
            "_id": "64aee32ad5b8f4fc61f5f8b3",
            "name": "Let's Go Swimming DELETE 2",
            "audio_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp3",
            "tags": [
              "dj khaled",
              "swimming"
            ],
            "category": "DJ Khaled",
            "play_count": 2,
            "video_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp4",
            "createdAt": "2023-07-12T17:30:18.396Z",
            "updatedAt": "2023-07-13T22:23:18.527Z",
            "__v": 0
          },
          {
            "_id": "2",
            "name": "Let's Go Swimming DELETE 2",
            "audio_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp3",
            "tags": [
              "dj khaled",
              "swimming"
            ],
            "category": "DJ Khaled",
            "play_count": 2,
            "video_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-golfing.mp4",
            "createdAt": "2023-07-12T17:30:18.396Z",
            "updatedAt": "2023-07-13T22:23:18.527Z",
            "__v": 0
          },
          {
            "_id": "3",
            "name": "Let's Go Swimming DELETE 2",
            "audio_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp3",
            "tags": [
              "dj khaled",
              "swimming"
            ],
            "category": "DJ Khaled",
            "play_count": 2,
            "video_source": "https://soundboard-app-dev.s3.amazonaws.com/lets-go-swimming/lets-go-swimming.mp4",
            "createdAt": "2023-07-12T17:30:18.396Z",
            "updatedAt": "2023-07-13T22:23:18.527Z",
            "__v": 0
          },
        ],
      },
    ],
    "hasMorePages": true,
    "totalSoundCount": 24
  };

export const DATA = [
  {
    title: 'Main dishes',
    data: ['Pizza', 'Burger', 'Risotto'],
  },
  {
    title: 'Sides',
    data: ['French Fries', 'Onion Rings', 'Fried Shrimps'],
  },
  {
    title: 'Drinks',
    data: ['Water', 'Coke', 'Beer'],
  },
  {
    title: 'Desserts',
    data: ['Cheese Cake', 'Ice Cream'],
  },
];
