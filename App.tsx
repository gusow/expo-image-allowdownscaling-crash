import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// 7200x7200 JPEG (the copy committed in this repo's assets folder, served over HTTP
// to match how production apps load large photos).
// Decoded at ARGB_8888 it is 7200 * 7200 * 4 = 207,360,000 bytes — above the
// default 100 MB hardware canvas limit enforced by RecordingCanvas.throwIfCannotDraw.
const HUGE_IMAGE = {
  uri: 'https://raw.githubusercontent.com/gusow/expo-image-allowdownscaling-crash/main/assets/huge-7200.jpg',
};

export default function App() {
  const [mode, setMode] = useState<'none' | 'safe' | 'crash'>('none');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>expo-image: allowDownscaling crash repro</Text>
      <Text style={styles.subtitle}>
        The image is a 7200x7200 JPEG (207 MB decoded at ARGB_8888).
      </Text>

      <Pressable style={styles.button} onPress={() => setMode('safe')}>
        <Text style={styles.buttonLabel}>1. Render with default allowDownscaling — works</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.crashButton]} onPress={() => setMode('crash')}>
        <Text style={styles.buttonLabel}>
          2. Render with allowDownscaling={'{false}'} — crashes on Android
        </Text>
      </Pressable>

      <View style={styles.imageContainer}>
        {mode === 'safe' && (
          <Image source={HUGE_IMAGE} style={styles.image} contentFit="contain" />
        )}
        {mode === 'crash' && (
          <Image
            source={HUGE_IMAGE}
            style={styles.image}
            contentFit="contain"
            allowDownscaling={false}
          />
        )}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  crashButton: {
    backgroundColor: '#dc2626',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 14,
  },
  imageContainer: {
    flex: 1,
    marginVertical: 16,
  },
  image: {
    flex: 1,
  },
});
