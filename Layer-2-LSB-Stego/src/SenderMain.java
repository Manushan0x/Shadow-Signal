import java.io.File;

public class SenderMain {
    public static void main(String[] args) {
        try {
            File cover = new File("resources/cover.wav");
            File secret = new File("resources/secret.wav"); // Your output.wav
            File stego = new File("resources/stego_output.wav");

            System.out.println("--- SENDER MODE ---");
            if (!cover.exists() || !secret.exists()) {
                System.out.println("Error: Missing cover.wav or secret.wav in resources folder.");
                return;
            }

            AudioEncoder.encode(cover, secret, stego);
            System.out.println("Success! 'stego_output.wav' is ready to be sent.");
            
        } catch (Exception e) {
            System.err.println("Encoding failed: " + e.getMessage());
        }
    }
}