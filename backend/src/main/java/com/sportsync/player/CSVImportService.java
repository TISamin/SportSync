package com.sportsync.player;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.sportsync.domain.Player;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CSVImportService {

    private Integer parseSafeInt(String val) {
        if (val == null) return null;
        String clean = val.trim();
        if (clean.isEmpty()) return null;
        // If there's a decimal point (like 100.00), take the part before it
        if (clean.contains(".")) {
            clean = clean.split("\\.")[0];
        }
        // Remove all non-digit characters (like $, commas, spaces) except negative signs
        clean = clean.replaceAll("[^\\d-]", "");
        if (clean.isEmpty()) return null;
        try {
            return Integer.parseInt(clean);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public List<Player> parsePlayersCsv(MultipartFile file, Long roomId) {
        List<Player> players = new ArrayList<>();

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVReader csvReader = new CSVReader(reader)) {

            // Skip header
            String[] header = csvReader.readNext();
            if (header == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }

            String[] line;
            while ((line = csvReader.readNext()) != null) {
                if (line.length < 9) continue; // Basic validation

                Player player = new Player();
                player.setAuctionRoomId(roomId);
                
                // name, age, batch, role, style, category, image_url, player_number, base_price
                player.setName(line[0].trim());
                
                Integer age = parseSafeInt(line[1]);
                if (age != null) player.setAge(age);
                
                // line[2] is batch, ignored for now as it's not in the entity based on schema
                
                player.setRole(line[3].trim());
                player.setStyle(line[4].trim());
                player.setCategory(line[5].trim());
                player.setImageUrl(line[6].trim());
                
                Integer playerNumber = parseSafeInt(line[7]);
                if (playerNumber != null) player.setPlayerNumber(playerNumber);
                
                Integer basePrice = parseSafeInt(line[8]);
                player.setBasePrice(basePrice != null ? basePrice : 0);

                players.add(player);
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage(), e);
        }

        return players;
    }
}
