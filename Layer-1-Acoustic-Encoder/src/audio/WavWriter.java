package audio;

import javax.sound.sampled.*;
import java.io.*;

public class WavWriter {

    public static void save(byte[] data, File file) throws Exception {

        AudioFormat format = new AudioFormat(44100, 8, 1, true, false);

        ByteArrayInputStream bais = new ByteArrayInputStream(data);

        AudioInputStream ais = new AudioInputStream(bais, format, data.length);

        AudioSystem.write(ais, AudioFileFormat.Type.WAVE, file);
    }
}