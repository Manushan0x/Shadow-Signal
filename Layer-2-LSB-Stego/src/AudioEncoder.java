import javax.sound.sampled.*;
import java.io.*;
import java.nio.file.Files;

public class AudioEncoder {
    public static void encode(File coverFile, File secretFile, File outputFile) throws Exception {
        // 1. Read the cover file using AudioSystem (This handles the header automatically)
        AudioInputStream ais = AudioSystem.getAudioInputStream(coverFile);
        AudioFormat format = ais.getFormat();
        byte[] audioData = ais.readAllBytes(); // These are just the sound samples
        ais.close();

        // 2. Read the secret file bytes
        byte[] secretData = Files.readAllBytes(secretFile.toPath());
        int secretLen = secretData.length;

        // 3. Safety Check: 1 byte of secret needs 8 bytes of cover
        if (audioData.length < (secretLen * 8 + 32)) {
            throw new Exception("Cover audio is too short! Use a longer song.");
        }

        int offset = 0;

        // 4. Embed the length (32 bits) into the first 32 samples
        for (int i = 0; i < 32; i++) {
            int bit = (secretLen >> (31 - i)) & 1;
            audioData[offset] = (byte) ((audioData[offset] & 0xFE) | bit);
            offset++;
        }

        // 5. Embed the actual secret bytes
        for (byte b : secretData) {
            for (int i = 7; i >= 0; i--) {
                int bit = (b >> i) & 1;
                audioData[offset] = (byte) ((audioData[offset] & 0xFE) | bit);
                offset++;
            }
        }

        // 6. Save the file while preserving the original WAV Format (Playable!)
        ByteArrayInputStream bais = new ByteArrayInputStream(audioData);
        AudioInputStream outputStream = new AudioInputStream(bais, format, audioData.length / format.getFrameSize());
        AudioSystem.write(outputStream, AudioFileFormat.Type.WAVE, outputFile);
        
        System.out.println("Encoding successful! The file is now a playable WAV.");
    }
}