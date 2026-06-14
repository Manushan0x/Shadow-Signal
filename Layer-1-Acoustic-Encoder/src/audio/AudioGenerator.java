package audio;

import java.io.ByteArrayOutputStream;

public class AudioGenerator {

    static final float SR = 44100;
    static final int DOT = 90;
    static final int DASH = 250;
    static final int GAP = 80;
    static final float FREQ = 800;

    public static byte[] generateMorseAudio(String morse) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        for (char c : morse.toCharArray()) {
            switch (c) {
                case '.':
                    out.write(tone(DOT), 0, tone(DOT).length);
                    out.write(silence(GAP), 0, silence(GAP).length);
                    break;
                case '-':
                    out.write(tone(DASH), 0, tone(DASH).length);
                    out.write(silence(GAP), 0, silence(GAP).length);
                    break;
                case ' ':
                    out.write(silence(GAP * 2), 0, silence(GAP * 2).length);
                    break;
                case '/':
                    out.write(silence(GAP * 5), 0, silence(GAP * 5).length);
                    break;
            }
        }

        return out.toByteArray();
    }

    private static byte[] tone(int ms) {
        int samples = (int)(ms * SR / 1000);
        byte[] data = new byte[samples];

        for (int i = 0; i < samples; i++) {
            double angle = 2 * Math.PI * i * FREQ / SR;
            data[i] = (byte)(Math.sin(angle) * 120);
        }

        return data;
    }

    private static byte[] silence(int ms) {
        int samples = (int)(ms * SR / 1000);
        return new byte[samples];
    }
}