import java.io.*;
import java.nio.file.Files;

public class AudioDecoder {
    public static void decode(File stegoFile, File decodedOutputFile) throws IOException {
        byte[] stegoBytes = Files.readAllBytes(stegoFile.toPath());
        int offset = 44; // Skip header

        // 1. Extract Secret Length (32 bits)
        int secretLen = 0;
        for (int i = 0; i < 32; i++) {
            secretLen = (secretLen << 1) | (stegoBytes[offset] & 1);
            offset++;
        }

        // 2. Extract Secret Bytes
        byte[] secretBytes = new byte[secretLen];
        for (int i = 0; i < secretLen; i++) {
            int b = 0;
            for (int bit = 0; bit < 8; bit++) {
                b = (b << 1) | (stegoBytes[offset] & 1);
                offset++;
            }
            secretBytes[i] = (byte) b;
        }

        Files.write(decodedOutputFile.toPath(), secretBytes);
        System.out.println("Decoding Complete: Secret extracted to " + decodedOutputFile.getName());
    }
}
