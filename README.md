# 🕵️‍♂️ Project Shadow-Signal: Multi-Layer Audio Steganography Suite

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-Swing%20%7C%20LSB-orange.svg)
![Web](https://img.shields.io/badge/Web-HTML%20%7C%20CSS%20%7C%20JS-yellow.svg)

**Shadow-Signal** is an advanced, two-layer audio steganography system. It conceals classified text messages by first converting them into an acoustic Morse code track hidden in ambient noise, and then cryptographically embedding that entire audio file inside a standard, playable music track using LSB (Least Significant Bit) manipulation.

> **🎙️ Try the live web decoder here:** [Insert your GitHub Pages link here]

![Hero Image](assets/hero-banner.png)
> *(Note to developer: Add a banner image here showing the Java terminal and the Web UI side-by-side)*

---

## 📑 Table of Contents
* [The Two-Layer Stealth Architecture](#-the-two-layer-stealth-architecture)
* [Quick Start: Mission Briefing](#-quick-start-mission-briefing)
* [Under the Hood: How it Works](#-under-the-hood-how-it-works)
* [How to Run it Correctly](#-how-to-run-it-correctly)
* [Directory Structure](#-directory-structure)

---

## 🏗️ The Two-Layer Stealth Architecture

This project achieves absolute secrecy by using two different methods of audio obfuscation:

1. **Layer 1 (Acoustic Camouflage):** The user inputs a text message. A Java Swing UI converts this text to Morse code (800Hz) and buries it under procedurally generated ambient noise and Gaussian hum.
2. **Layer 2 (LSB Steganography):** The resulting Morse audio file is treated as raw data. A Java command-line tool (`SenderMain`) embeds this file into the Least Significant Bits of a "cover" song. The final file (`stego_output.wav`) sounds exactly like the original cover song to the human ear.
3. **Extraction:** The receiver runs `ReceiverMain` to rip the hidden Morse audio file out of the cover song.
4. **Decryption:** The isolated Morse audio is dropped into a browser-based Goertzel algorithm decoder, which reads the 800Hz envelope and translates it back to English text.

---

## 🚀 Quick Start: Mission Briefing

### Phase 1: Create the Covert Signal
Run the Desktop UI to generate your encrypted Morse audio.
1. Run `src/ui/UI.java`.
2. Type your message and click **Generate Audio**. This creates `output.wav`.

### Phase 2: Embed into Cover Music (LSB Encoding)
Hide your `output.wav` inside a normal song so you can send it safely over the internet.
1. Rename `output.wav` to `secret.wav` and place it in the `resources/` folder[cite: 12].
2. Place any normal WAV song in the `resources/` folder and name it `cover.wav`[cite: 12].
3. Run the Sender application to generate `stego_output.wav` — a perfectly playable song carrying your hidden message[cite: 12].

### Phase 3: Extraction and Decryption
When the operative receives `stego_output.wav`, they extract the data.
1. Place the received `stego_output.wav` file in the `resources/` folder[cite: 10].
2. Run the Receiver application to extract the hidden track[cite: 10]. This will save the secret audio as `extracted_secret.wav`[cite: 10].
3. Open `index.html` (the Web Decoder) and drag and drop the newly extracted `extracted_secret.wav` into the dropzone to reveal the text!

---

## 🧮 Under the Hood: How it Works

### Audio-in-Audio LSB Steganography
The `AudioEncoder.java` manipulates the 8-bit sample data of the cover audio. It breaks down the bytes of the secret WAV file into individual bits, replacing only the 1st bit (the least significant bit) of every 8 bytes of the cover song[cite: 7]. It also embeds a 32-bit length header in the first 32 samples so the decoder knows exactly how much data to extract[cite: 7]. This alters the amplitude of the cover song by a maximum of 1/256th per sample, making the alteration mathematically undetectable to the human ear.

### Goertzel DFT Envelope Detection
Once the Morse audio is extracted, the web decoder uses the **Goertzel algorithm** to perform a sliding Discrete Fourier Transform (DFT) across 20ms windows. This acts as a highly targeted bandpass filter, ignoring the ambient hum and locking purely onto the 800Hz Morse carrier wave. 

---

## 💻 How to Run it Correctly

If you are using a terminal or command prompt, follow these steps:

**1. Compile everything first:**
```bash
javac src/*.java


Phase 2: Embed into Cover Music (LSB Encoding)
Hide your output.wav inside a normal song so you can transmit it safely.

Rename output.wav to secret.wav and place it in the Layer 2 resources/ folder.

Place any normal WAV song in the resources/ folder and name it cover.wav.

Compile and run the Sender:

Bash
javac src/*.java
java -cp src SenderMain
This generates stego_output.wav — a perfectly playable song carrying your hidden message.

Phase 3: Extraction and Decryption
When the receiving operative gets stego_output.wav, they extract the data.

Place the received stego_output.wav file in the Layer 2 resources/ folder.

Run the Receiver to extract the hidden track:

Bash
java -cp src ReceiverMain
(This saves the secret audio as extracted_secret.wav)

Open index.html (the Web Decoder) in your browser.

Drag and drop the newly extracted extracted_secret.wav into the dropzone to reveal the classified text.

🧮 Under the Hood: DSP & Cryptography
Audio-in-Audio LSB Steganography
The AudioEncoder.java manipulates the 8-bit sample data of the cover audio. It breaks down the bytes of the secret WAV file into individual bits, replacing only the 1st bit (the least significant bit) of every 8 bytes of the cover song. It also embeds a 32-bit length header in the first 32 samples so the decoder knows exactly how much data to extract. This alters the amplitude of the cover song by a maximum of 1/256th per sample, making the alteration mathematically undetectable to the human ear.

Goertzel DFT Envelope Detection
Once the Morse audio is extracted, the web decoder uses the Goertzel algorithm to perform a sliding Discrete Fourier Transform (DFT) across 20ms windows. This acts as a highly targeted bandpass filter, ignoring the ambient hum and locking purely onto the 800Hz Morse carrier wave.

📁 Directory Structure
Plaintext
Shadow-Signal/
│
├── Layer-1-Acoustic-Encoder/      # Java Swing UI (Text -> Morse WAV)
│   └── src/
│       ├── audio/                 # Signal mixing & generation
│       ├── morse/                 # Text-to-Morse translation
│       ├── ui/                    # Desktop interface
│       └── Main.java
│
├── Layer-2-LSB-Stego/             # Terminal tools (WAV -> Cover Song)
│   ├── src/
│   │   ├── AudioEncoder.java
│   │   ├── AudioDecoder.java
│   │   ├── SenderMain.java
│   │   └── ReceiverMain.java
│   └── resources/                 
│       ├── cover.wav              # Your normal song (User provided)
│       ├── secret.wav             # The hidden morse track
│       ├── stego_output.wav       # The final encoded output
│       └── extracted_secret.wav   # The decoded output from the receiver
│
└── Layer-3-Web-Decoder/           # Browser DSP UI (Morse WAV -> Text)
    ├── index.html        
    ├── style.css         
    └── decoder.js
