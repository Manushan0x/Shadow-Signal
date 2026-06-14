package morse;

import java.util.HashMap;
import java.util.Map;

public class MorseConverter {

    private static final Map<Character, String> map = new HashMap<>();

    static {
        map.put('A', ".-"); map.put('B', "-...");
        map.put('C', "-.-."); map.put('D', "-..");
        map.put('E', "."); map.put('F', "..-.");
        map.put('G', "--."); map.put('H', "....");
        map.put('I', ".."); map.put('J', ".---");
        map.put('K', "-.-"); map.put('L', ".-..");
        map.put('M', "--"); map.put('N', "-.");
        map.put('O', "---"); map.put('P', ".--.");
        map.put('Q', "--.-"); map.put('R', ".-.");
        map.put('S', "..."); map.put('T', "-");
        map.put('U', "..-"); map.put('V', "...-");
        map.put('W', ".--"); map.put('X', "-..-");
        map.put('Y', "-.--"); map.put('Z', "--..");
        map.put(' ', "/");
    }

    public static String toMorse(String text) {
        StringBuilder sb = new StringBuilder();

        for (char c : text.toCharArray()) {
            sb.append(map.getOrDefault(c, "")).append(" ");
        }

        return sb.toString();
    }
}