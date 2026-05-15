package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;
import java.util.*;

public class GlobalSearch {

    private String user = "root";
    private String password = "root";

    @Test
    public void searchAll() {
        String baseUrl = "jdbc:mysql://localhost:3306/?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection conn = DriverManager.getConnection(baseUrl, user, password);
             PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\global_search.txt")) {
            
            DatabaseMetaData meta = conn.getMetaData();
            try (ResultSet rs = meta.getCatalogs()) {
                while (rs.next()) {
                    String schema = rs.getString(1);
                    if (schema.equals("information_schema") || schema.equals("performance_schema") || schema.equals("mysql") || schema.equals("sys")) continue;
                    
                    out.println("--- TABLES IN SCHEMA: " + schema + " ---");
                    try (ResultSet tables = meta.getTables(schema, null, "%", new String[]{"TABLE"})) {
                        while (tables.next()) {
                            String tableName = tables.getString("TABLE_NAME");
                            out.println("  TABLE: " + tableName);
                            
                            // Check for 'user' or 'name' columns to see if it's a person table
                            try (Connection schemaConn = DriverManager.getConnection("jdbc:mysql://localhost:3306/" + schema + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true", user, password)) {
                                Statement stmt = schemaConn.createStatement();
                                ResultSet rowRs = stmt.executeQuery("SELECT COUNT(*) FROM " + tableName);
                                if (rowRs.next()) {
                                    out.println("    Row Count: " + rowRs.getInt(1));
                                }
                            } catch (Exception e) {}
                        }
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
