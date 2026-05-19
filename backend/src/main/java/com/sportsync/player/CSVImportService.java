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
                
                try {
                    if (!line[1].trim().isEmpty()) player.setAge(Integer.parseInt(line[1].trim()));
                } catch (NumberFormatException e) {
                    // ignore age
                }
                
                // line[2] is batch, ignored for now as it's not in the entity based on schema
                
                player.setRole(line[3].trim());
                player.setStyle(line[4].trim());
                player.setCategory(line[5].trim());
                player.setImageUrl(line[6].trim());
                
                try {
                    if (!line[7].trim().isEmpty()) player.setPlayerNumber(Integer.parseInt(line[7].trim()));
                } catch (NumberFormatException e) {
                    // ignore player number
                }
                
                try {
                    if (!line[8].trim().isEmpty()) player.setBasePrice(Integer.parseInt(line[8].trim()));
                } catch (NumberFormatException e) {
                    player.setBasePrice(0);
                }

                players.add(player);
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage(), e);
        }

        return players;
    }
}
