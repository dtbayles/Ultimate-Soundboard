import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { API_KEY, API_URL, S3_BUCKET, S3_BASE_URL, REGION, ACCESS_KEY_ID, SECRET_ACCESS_KEY} from '@env';
import {Audio, Video} from "expo-av";
import {Ionicons} from "@expo/vector-icons";
import AWS from 'aws-sdk'

const Upload = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const { colors } = useTheme();
  const styles = componentStyles(colors);
  const ref = useRef(null);
  const [status, setStatus] = useState({});
  const [progress , setProgress] = useState(0);

  AWS.config.update({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  })

  const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
  })

  useEffect(() => {
    console.log('File.uri:', file ? file.uri : null);
  }, [file]);

  useEffect(() => {
    if (status.isPlaying) triggerAudio(ref);
  }, [ref, status.isPlaying]);

  const triggerAudio = async (ref) => {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    ref.current.playAsync();
  };

  const pickFile = async () => {
    try {
      const response = await DocumentPicker.getDocumentAsync({
        type: ['audio/*','video/*'],
        copyToCacheDirectory: true,
      });

      if (response.type === 'success') {
        const { name, size, uri } = response;
        const nameParts = name.split('.');
        const fileType = nameParts[nameParts.length - 1];
        const allowedFileTypes = ['mp3', 'mp4', 'm4a'];

        if (allowedFileTypes.includes(fileType.toLowerCase())) {
          const typePrefix = fileType.toLowerCase() === 'mp4' ? 'video' : 'audio';

          console.log('allowedFileTypes:', allowedFileTypes)
          console.log('typePrefix:', typePrefix)
          console.log('fileType:', fileType)

          const fileToUpload = {
            name: name,
            size: size,
            uri: uri,
            type: fileType,
            typePrefix: typePrefix,
          };

          setFile(fileToUpload);
        } else {
          // Display an error message or perform any desired action
          console.log('Invalid file type. Please select an audio or video file.');
          setFile(null);
        }
      } else {
        setFile(null);
      }
    } catch (err) {
      setFile(null);
      console.warn(err);
    }
  };

  const uploadFileToS3 = () => {

    const params = {
      ACL: 'public-read',
      Body: null, // Leave this as null for now
      Bucket: S3_BUCKET,
      Key: `${name}.${file.type}`,
    };

    fetch(file.uri)
        .then(response => response.blob())
        .then(async blob => {
          params.Body = blob;

          myBucket.putObject(params)
              .on('httpUploadProgress', (evt) => {
                setProgress(Math.round((evt.loaded / evt.total) * 100));
              })
              .send((err) => {
                if (err) {
                  console.log(`AWS Error: ${err}`);
                  // Handle the error, e.g., show an error message to the user.
                } else {
                  // If putObject is successful, proceed to postFile
                  const formattedName = encodeURIComponent(name);
                  const formattedUrl = `${S3_BASE_URL}/${formattedName}.${file.type}`;
                  postFile(formattedUrl);
                }
              });
        })
        .catch(error => {
          console.log('Error reading file content:', error);
        });
  }

  const postFile = async (formattedUrl) => {
    const endpoint = API_URL;
    let video_source = '';
    let audio_source = formattedUrl;
    if (file.typePrefix === 'video') {
      video_source = formattedUrl;
    }
    const body = {
      name: name,
      audio_source: audio_source,
      tags: [""],
      category: category,
      video_source: video_source,
    }
    const options = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    };

    try {
      const response = await fetch(endpoint, options);
      if (response.ok) {
        console.log('Document uploaded successfully');
        // Display a success message to the user or perform any additional actions
      } else {
        throw new Error(`${response.status} Failed to create sound POST /create. ${response.statusText}`);
      }
    } catch (error) {
      console.log('Error uploading document:', error);
      // Display an error message to the user or perform error handling logic
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.introTextContainer}>
          <Text style={[styles.introTextStyle, { paddingBottom: 10 }]}>Want to add a sound to the app? Upload a file or send a URL with any other details.</Text>
          {/*<Text style={styles.introTextStyle}>All media requires approval before displaying (typically within 24 hours)</Text>*/}
        </View>
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.textStyle}>Sound Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.textStyle}>Sound Category</Text>
            <TextInput
              style={styles.textInput}
              value={category}
              onChangeText={setCategory}
              placeholder="Enter category"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.textStyle}>Sound URL</Text>
            <TextInput
              style={styles.textInput}
              value={url}
              onChangeText={setUrl}
              placeholder="Enter URL"
              clearButtonMode={"always"}
            />
          </View>
          <View style={styles.previewContainer}>
            {file && file.uri ? (
              <>
                <Video
                  ref={ref}
                  source={{ uri: file.uri }}
                  style={styles.previewMedia}
                  resizeMode="contain"
                  useNativeControls
                  onPlaybackStatusUpdate={(status) => setStatus(status)}
                />
                <TouchableOpacity style={styles.clearButton} onPress={() => setFile(null)}>
                  <Ionicons name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.uploadFileSelector} onPress={pickFile}>
                <Ionicons name="cloud-upload" size={50} color={colors.text} />
                <Text style={styles.textStyle}>Select a file to upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.uploadButtonStyle} activeOpacity={0.5} onPress={uploadFileToS3}>
          <Text style={styles.buttonTextStyle}>Upload File</Text>
          <Text style={styles.textStyle}>Status: {progress}%</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const componentStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 35,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 15,
    paddingLeft: 10,
    width: '100%',
    color: colors.text,
  },
  formRow: {
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 20,
    height: 80,
  },
  uploadButtonStyle: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 50,
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 35,
  },
  textStyle: {
    color: colors.text,
  },
  previewContainer: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    alignContent: 'center',
  },
  previewMedia: {
    height: '100%',
    width: '100%',
  },
  introTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  introTextStyle: {
    color: colors.text,
    fontSize: 18,
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  uploadFileSelector: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Upload;
