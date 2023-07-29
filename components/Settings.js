import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking, Share, FlatList, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Email } from 'react-native-mail';
import {useTheme} from "@react-navigation/native";

const Settings = () => {
  const { colors } = useTheme();
  const styles = componentStyles(colors);

  const handleRemoveAds = () => {
    // Code to handle removing ads forever
  };

  const handleRestorePurchases = () => {
    // Code to handle restoring purchases
  };

  const handleMoreAboutDeveloper = () => {
    // Code to handle linking to more about the developer
    Linking.openURL('https://drewbayles.com');
  };

  const handleContactDeveloper = () => {
    const recipientEmail = 'drew@dreamtechlab.com';
    const subject = 'Feedback on Soundboard App';

    const emailUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(emailUrl)
      .then(() => {
        console.log('Email opened');
      })
      .catch((error) => {
        console.log('Failed to open email:', error);
      });
  }

  const handleRateApp = () => {
    // Code to handle rating the app
  }

  const handleShareApp = async () => {
    try {
      const shareOptions = {
        message: 'Check out this awesome app!',
      };
      await Share.share(shareOptions);
    } catch (error) {
      console.log('Sharing error:', error);
    }
  };

  const options = [
    {
      id: 'removeAds',
      icon: 'md-close-circle-outline',
      color: '#FF0000',
      text: 'Remove Ads Forever',
      onPress: handleRemoveAds,
    },
    {
      id: 'restorePurchases',
      icon: 'md-refresh-circle-outline',
      // color: '#000000',
      color: colors.text,
      text: 'Restore Purchases',
      onPress: handleRestorePurchases,
    },
    {
      id: 'contactDeveloper',
      icon: 'md-person-outline',
      // color: '#000000',
      color: colors.text,
      text: 'Contact the Developer',
      onPress: handleContactDeveloper,
    },
    {
      id: 'moreAboutDeveloper',
      icon: 'md-information-circle-outline',
      // color: '#000000',
      color: colors.text,
      text: 'More About the Developer',
      onPress: handleMoreAboutDeveloper,
    },
    {
      id: 'rateApp',
      icon: 'md-star-outline',
      // color: '#000000',
      color: colors.text,
      text: 'Rate App',
      onPress: handleRateApp,
    },
    {
      id: 'shareApp',
      icon: 'md-share-outline',
      // color: '#000000',
      color: colors.text,
      text: 'Share App',
      onPress: handleShareApp,
    },
  ];

  const renderOption = ({ item }) => (
    <TouchableOpacity onPress={item.onPress} style={styles.option}>
      <View style={styles.optionContainer}>
        <Ionicons name={item.icon} size={24} color={item.color} />
        <Text style={[styles.optionText, { color: colors.text }]}>{item.text}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={options}
        renderItem={renderOption}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.optionList}
      />
      <View style={styles.footer}>
        <Text style={styles.version}>Version 0.1</Text>
        <Text style={styles.footerText}>&#169; Dream Tech LLC</Text>
      </View>
    </View>
  );
};

const componentStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  optionList: {
    paddingBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    // borderBottomColor: '#EDEDED',
    borderBottomColor: colors.border,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  version: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text,
  },
});

export default Settings;
