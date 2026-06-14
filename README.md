# 🕵️‍♂️ Project Shadow-Signal: Audio Steganography Suite

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-Swing-orange.svg)
![Web](https://img.shields.io/badge/Web-HTML%20%7C%20CSS%20%7C%20JS-yellow.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)

**Shadow-Signal** is an end-to-end audio steganography system. It consists of a Java-based encoder that conceals text messages as Morse code within synthesized ambient noise, and a browser-based decoder that mathematically extracts and decrypts the hidden transmission using the Goertzel algorithm.

> **🎙️ Try the live field decoder here:** [Insert your GitHub Pages link here]

![Hero Image](assets/hero-banner.png)
> *Note to developer: Create a wide banner image showing both the Java UI and the Web UI side-by-side, or a cool waveform graphic, and save it as `assets/hero-banner.png`.*

---

## 📑 Table of Contents
* [Features](#-features)
* [System Architecture](#-system-architecture)
* [Quick Start (Mission Briefing)](#-quick-start-mission-briefing)
* [Under the Hood: Signal Processing](#-under-the-hood-signal-processing)
* [Directory Structure](#-directory-structure)

---

## 🌟 Features

* **Java Desktop Encoder:** A lightweight Swing UI that translates text to Morse code.
* **Dynamic Audio Synthesis:** Generates an 800Hz Morse carrier tone and buries it inside a procedurally generated ambient track (combined sine waves and Gaussian noise).
* **Browser-Based Decoder:** A purely client-side web application with a classified, spy-terminal aesthetic.
* **Real-time Visualization:** Displays the raw waveform, the 800Hz filtered power band, and the Morse envelope detection.

---

## 🏗️ System Architecture

1. **Input:** The operator types a secret message into the Java UI.
2. **Modulation:** The text is converted to Morse code timings (Dot=90ms, Dash=250ms, Gap=80ms).
3. **Obfuscation:** The Morse signal is mixed into ambient noise (220Hz + 330Hz + 110Hz sine waves + Gaussian noise) at a specific ratio (`signal×2 + noise÷2`) and exported as `output.wav`.
4. **Extraction:** The operator drops `output.wav` into the web decoder.
5. **Decryption:** The web app parses the WAV headers, isolates the 800Hz frequency, detects the envelope using moving averages, and translates the Morse string back to English text.

![Architecture Diagram](assets/architecture-flow.png)
> *Note to developer: Create a simple flowchart diagram (using draw.io or similar) showing Text -> Java Encoder -> WAV File -> Web Decoder -> Text, and save it as `assets/architecture-flow.png`.*

---

## 🚀 Quick Start (Mission Briefing)

### Part 1: Generating the Transmission (Encoder)
Ensure you have the Java Development Kit (JDK) installed.

1. Navigate to the `encoder-java/src` directory.
2. Compile and run the `Main.java` file.
3. Type your secret message into the top text box and click **Generate Audio**.
4. The system will drop an `output.wav` file in the project root.

![Java Encoder Demo](assets/encoder-demo.gif)
> *Note to developer: Record a 5-second GIF of you typing a message into the Java UI and clicking Generate, and save it as `assets/encoder-demo.gif`.*


No installation required. 

1. Open `decoder-web/index.html` in any modern web browser.
2. Drag and drop the `output.wav` file onto the radar interface.
3. Watch the decryption pipeline extract your message in real-time.

![Web Decoder Demo](assets/decoder-demo.gif)
> *Note to developer: Record a GIF of dragging the WAV file into the web app and the green text revealing the secret message, and save it as `assets/decoder-demo.gif`.*

---

## 🧮 Under the Hood: Signal Processing

The decoder is strictly calibrated to match the Java encoder parameters exactly:

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Carrier Freq** | 800 Hz | The specific sine wave frequency of the Morse signal. |
| **Dot ( $\cdot$ )** | 90 ms | Duration of a Morse dot. |
| **Dash ( $-$ )** | 250 ms | Duration of a Morse dash. |
| **Intra-Gap** | 80 ms | Silence between dots and dashes. |

The web decoder utilizes the **Goertzel algorithm** to perform a sliding Discrete Fourier Transform (DFT) across 20ms windows. This acts as a highly targeted bandpass filter, ignoring the low-frequency ambient hum and chaotic Gaussian noise, allowing the envelope detector to trace the original 800Hz Morse pattern.

---

## 📁 Directory Structure

```text
Shadow-Signal/
│
├── encoder-java/         # Java Swing application
│   └── src/
│       ├── audio/        # Generation and mixing logic
│       ├── morse/        # Text-to-Morse translation
│       └── ui/           # Desktop interface
│
├── Hide with Audio/         # Java  application
│   └── resources/
│   └── AudioDecoder.java      
│   └── AudioEncoder.java 
│   └── ReceiverMain.java        
    └── SenderMain.java
    └── README.md

├── decoder-web/          # Browser-based extraction tool
│   ├── index.html        # Spy-terminal interface
│   ├── style.css         # Classified aesthetics
│   └── decoder.js        # DSP and parsing logic
│
└── assets/               # Readme documentation images
