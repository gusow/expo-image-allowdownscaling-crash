# expo-image: `allowDownscaling={false}` crash repro (Android)

Minimal reproducible example for a fatal Android crash in `expo-image`:

```
java.lang.RuntimeException: Canvas: trying to draw too large(207360000bytes) bitmap.
       at android.graphics.RecordingCanvas.throwIfCannotDraw(RecordingCanvas.java:268)
       at android.graphics.BaseRecordingCanvas.drawBitmap(BaseRecordingCanvas.java:99)
       at android.graphics.drawable.BitmapDrawable.draw(BitmapDrawable.java:569)
       at android.widget.ImageView.onDraw(ImageView.java:1446)
       at android.view.View.draw(View.java)
       at expo.modules.image.ExpoImageView.draw(ExpoImageView.kt:127)
```

## Steps to reproduce

```bash
git clone https://github.com/gusow/expo-image-allowdownscaling-crash
cd expo-image-allowdownscaling-crash
npm install
npx expo run:android
```

1. Tap **"1. Render with default allowDownscaling"** — the image renders fine.
2. Tap **"2. Render with allowDownscaling={false}"** — the app crashes as soon as the image draws.

The bundled image (`assets/huge-7200.jpg`) is a 7200x7200 JPEG. Decoded at
ARGB_8888 it is `7200 * 7200 * 4 = 207,360,000` bytes — above the 100 MB
hardware canvas limit enforced by `RecordingCanvas.throwIfCannotDraw`.

## Root cause

`createDownsampleStrategy` in
`expo-image/android/src/main/java/expo/modules/image/ExpoImageViewWrapper.kt`
returns `DownsampleStrategy.NONE` when `allowDownscaling` is `false`, skipping
the `SafeDownsampleStrategy` that exists precisely to cap decodes at the
hardware canvas limit:

```kotlin
private fun createDownsampleStrategy(target: ImageViewWrapperTarget): DownsampleStrategy {
    return if (!allowDownscaling) {
      DownsampleStrategy.NONE          // <-- full-size decode, no cap, crashes at draw time
    } else if (
      contentFit != ContentFit.Fill &&
      contentFit != ContentFit.None
    ) {
      ContentFitDownsampleStrategy(target, contentFit)
    } else {
      // it won't downscale the image if the image is smaller than hardware bitmap size limit
      SafeDownsampleStrategy(decodeFormat)
    }
}
```

## Suggested fix

Return `SafeDownsampleStrategy(decodeFormat)` in the `!allowDownscaling`
branch. `SafeDownsampleStrategy.getScaleFactor` returns `1f` for any image
under the limit, so this is behavior-preserving for every image that renders
today and only downscales images that currently crash the app.
