package net.engineeringdigest.journalApp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String UPLOAD_DIR = "uploads/";

    public FileStorageService() {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return null;
        }

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + fileName);

        // Compress and Save
        compressAndSave(file, filePath);

        return fileName;
    }

    private void compressAndSave(MultipartFile file, Path targetPath) throws IOException {
        // Basic check: if not an image, just save it
        if (!file.getContentType().startsWith("image/")) {
            Files.write(targetPath, file.getBytes());
            return;
        }

        try {
            // Read the image
            java.awt.image.BufferedImage originalImage = javax.imageio.ImageIO.read(file.getInputStream());
            if (originalImage == null) {
                // Fallback for non-readable images
                Files.write(targetPath, file.getBytes());
                return;
            }

            // Create a new file output stream
            File outputFile = targetPath.toFile();

            // Simple compression logic: Write as JPEG
            // This re-encodes the image, often reducing size if it was a heavy PNG or raw.
            // For more advanced compression, we'd need more logic, but this is a standard
            // "store compressed" approach.
            // We use standard ImageIO write. For explicit quality control, we'd need
            // ImageWriter params.
            // Currently keeping it simple: Write as jpg (or original format if preferred,
            // but jpg is good for photos)

            String extension = getExtension(file.getOriginalFilename());
            if ("png".equalsIgnoreCase(extension)) {
                javax.imageio.ImageIO.write(originalImage, "png", outputFile);
            } else {
                // Default to jpg for photos as it is efficient
                // Convert to RGB if needed (e.g. from ARGB png saved as jpg)
                java.awt.image.BufferedImage rgbImage = new java.awt.image.BufferedImage(
                        originalImage.getWidth(), originalImage.getHeight(), java.awt.image.BufferedImage.TYPE_INT_RGB);
                rgbImage.createGraphics().drawImage(originalImage, 0, 0, java.awt.Color.WHITE, null);
                javax.imageio.ImageIO.write(rgbImage, "jpg", outputFile);
            }

        } catch (Exception e) {
            // Fallback to raw write if compression fails
            e.printStackTrace();
            Files.write(targetPath, file.getBytes());
        }
    }

    private String getExtension(String filename) {
        if (filename == null)
            return "jpg";
        int dotIndex = filename.lastIndexOf(".");
        return (dotIndex == -1) ? "jpg" : filename.substring(dotIndex + 1);
    }
}
