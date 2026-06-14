package audio;

import java.util.Random;

public class AmbientMusicGenerator {

    public static byte[] generateAmbient(int length) {

        byte[] out = new byte[length];
        Random r = new Random();

        for (int i = 0; i < length; i++) {

            double t = i / 44100.0;

            double wave =
                    Math.sin(2 * Math.PI * 220 * t) * 30 +
                    Math.sin(2 * Math.PI * 330 * t) * 20 +
                    Math.sin(2 * Math.PI * 110 * t) * 15 +
                    r.nextGaussian() * 8;

            out[i] = (byte)Math.max(-127, Math.min(127, wave));
        }

        return out;
    }
}