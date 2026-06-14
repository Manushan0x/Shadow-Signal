package audio;

public class AudioMixer {

    public static byte[] mix(byte[] signal, byte[] noise) {

        int len = Math.min(signal.length, noise.length);
        byte[] out = new byte[len];

        for (int i = 0; i < len; i++) {

            int s = signal[i] * 2;
            int n = noise[i] / 2;

            out[i] = (byte)Math.max(-127, Math.min(127, s + n));
        }

        return out;
    }
}