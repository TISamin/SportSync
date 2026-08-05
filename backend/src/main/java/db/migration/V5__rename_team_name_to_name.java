package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class V5__rename_team_name_to_name extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        
        boolean hasTeamName = false;
        boolean hasName = false;
        
        // Look up columns of table 'team'
        try (ResultSet rs = connection.getMetaData().getColumns(null, null, "team", null)) {
            while (rs.next()) {
                String columnName = rs.getString("COLUMN_NAME");
                if ("team_name".equalsIgnoreCase(columnName)) {
                    hasTeamName = true;
                }
                if ("name".equalsIgnoreCase(columnName)) {
                    hasName = true;
                }
            }
        }
        
        try (Statement statement = connection.createStatement()) {
            if (hasTeamName && hasName) {
                // Both columns exist in DB. Reconcile data and drop the duplicate 'team_name' column
                statement.execute("UPDATE team SET name = team_name WHERE name IS NULL OR name = ''");
                statement.execute("ALTER TABLE team DROP COLUMN team_name");
            } else if (hasTeamName) {
                // Only 'team_name' exists in DB. Rename it back to 'name'
                statement.execute("ALTER TABLE team CHANGE team_name name VARCHAR(100) NOT NULL");
            }
            // If only 'name' exists, we are already in the correct state.
        }
    }
}
