import java.io.File;

public class ReceiverMain {
    public static void main(String[] args) {
        try {
            File stego = new File("resources/stego_output.wav");
            File decoded = new File("resources/extracted_secret.wav");

            System.out.println("--- RECEIVER MODE ---");
            if (!stego.exists()) {
                System.out.println("Error: No 'stego_output.wav' found in resources.");
                return;
            }

            AudioDecoder.decode(stego, decoded);
            System.out.println("Success! Secret audio saved as 'extracted_secret.wav'.");

        } catch (Exception e) {
            System.err.println("Decoding failed. The file may be corrupted or compressed.");
        }
    }
}