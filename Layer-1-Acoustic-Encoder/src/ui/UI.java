package ui;

import morse.MorseConverter;
import audio.*;

import javax.swing.*;
import java.awt.*;
import java.io.File;

public class UI {

    public UI() {
        JFrame frame = new JFrame("Morse + Ambient Noise System");
        frame.setSize(600, 350);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JTextArea input = new JTextArea(5, 40);
        JButton btn = new JButton("Generate Audio");
        JTextArea status = new JTextArea(5, 40);

        status.setEditable(false);

        btn.addActionListener(e -> {
            try {
                String text = input.getText().toUpperCase();

                String morse = MorseConverter.toMorse(text);

                byte[] morseAudio = AudioGenerator.generateMorseAudio(morse);
                byte[] ambient = AmbientMusicGenerator.generateAmbient(morseAudio.length);

                byte[] mixed = AudioMixer.mix(morseAudio, ambient);

                File file = new File("output.wav");
                WavWriter.save(mixed, file);

                status.setText("Saved output.wav\nHidden Morse inside ambient noise music.");

            } catch (Exception ex) {
                status.setText("Error: " + ex.getMessage());
            }
        });

        frame.setLayout(new FlowLayout());
        frame.add(new JScrollPane(input));
        frame.add(btn);
        frame.add(new JScrollPane(status));

        frame.setVisible(true);
    }
}