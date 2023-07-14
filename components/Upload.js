import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import DocumentPicker from 'expo-document-picker';

const Upload = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [singleFile, setSingleFile] = useState(null);
  const { colors } = useTheme();

  const checkPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.READ_EXTERNAL_STORAGE);
    return status === 'granted';
  };

  const uploadImage = async () => {
    const BASE_URL = 'xxxx';

    // Check if any file is selected or not
    if (singleFile) {
      // If file selected then create FormData
      const data = new FormData();

      data.append('file_attachment', {
        uri: singleFile.uri,
        name: singleFile.name,
        type: singleFile.type,
      });

      try {
        const res = await fetch(BASE_URL + 'tutorial/upload.php', {
          method: 'post',
          body: data,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          timeout: 5000,
        });

        const result = await res.json();
        console.log('result', result);
        if (result.status === 1) {
          Alert.alert('Info', result.msg);
        }
      } catch (error) {
        console.log('error upload', error);
      }
    } else {
      // If no file selected, show an alert
      Alert.alert('Please select a file first');
    }
  };

  const selectFile = async () => {
    const result = await checkPermissions();

    if (result) {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: false,
          type: 'image/*',
        });

        if (result.type === 'success') {
          console.log('res : ' + JSON.stringify(result));
          setSingleFile(result);
        }
      } catch (err) {
        setSingleFile(null);
        console.warn(err);
      }
    }
  };

  const handleSubmit = () => {
    console.log('Submitted:', name, category, audioUrl, videoUrl);
  };

  return (
    <View>
      <Text>Name:</Text>
      <TextInput
        style={{ color: colors.text }}
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
      />

      <Text>Category:</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Enter category"
      />

      <Text>Audio URL:</Text>
      <TextInput
        value={audioUrl}
        onChangeText={setAudioUrl}
        placeholder="Enter audio URL"
      />

      <Text>Video URL:</Text>
      <TextInput
        value={videoUrl}
        onChangeText={setVideoUrl}
        placeholder="Enter video URL"
      />

      <Button onPress={handleSubmit} title="Submit" />

      {singleFile && (
        <Text style={styles.textStyle}>
          File Name: {singleFile.name || ''}
          {'\n'}
          Type: {singleFile.type || ''}
          {'\n'}
          File Size: {singleFile.size || ''}
          {'\n'}
          URI: {singleFile.uri || ''}
          {'\n'}
        </Text>
      )}

      <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.5} onPress={selectFile}>
        <Text style={styles.buttonTextStyle}>Select File</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.5} onPress={uploadImage}>
        <Text style={styles.buttonTextStyle}>Upload File</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: '#307ecc',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  textStyle: {
    // Add any styles you want for the file details text
  },
});

export default Upload;
