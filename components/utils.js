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
