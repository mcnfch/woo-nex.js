/**
 * WordPress Media API utility functions
 * Handles authentication and file uploads to WordPress media library
 */

/**
 * Upload a file to WordPress media library
 * @param file The file to upload (File or Blob)
 * @param filename The name to use for the file
 * @returns The uploaded media object with URLs and metadata
 */
export async function uploadFileToWordPress(file: File | Blob, filename: string): Promise<any> {
  try {
    // Get WordPress credentials from environment variables
    const wpUsername = process.env.WP_USERNAME;
    const wpPassword = process.env.WP_PASSWORD;
    const wpUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

    if (!wpUsername || !wpPassword || !wpUrl) {
      throw new Error('WordPress credentials not found in environment variables');
    }

    // Step 1: Get JWT token
    console.log('[DEBUG] Getting JWT token for WordPress');
    const tokenResponse = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: wpUsername,
        password: wpPassword,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => null);
      throw new Error(`Failed to authenticate with WordPress: ${errorData?.message || tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const jwtToken = tokenData.token;

    // Step 2: Upload file to WordPress media library
    console.log('[DEBUG] Uploading file to WordPress media library');
    
    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Create a Blob with the correct MIME type
    const fileBlob = new Blob([fileBuffer], { type: file.type });
    
    const mediaResponse = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': file.type,
      },
      body: fileBlob,
    });

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.json().catch(() => null);
      throw new Error(`Failed to upload media to WordPress: ${errorData?.message || mediaResponse.statusText}`);
    }

    const mediaData = await mediaResponse.json();
    console.log('[DEBUG] File uploaded successfully to WordPress:', mediaData.id);
    
    return mediaData;
  } catch (error: any) {
    console.error('[DEBUG] Error uploading file to WordPress:', error);
    throw error;
  }
}

/**
 * Upload multiple files to WordPress media library
 * @param files Array of files to upload
 * @returns Array of uploaded media objects
 */
export async function uploadMultipleFilesToWordPress(files: File[]): Promise<any[]> {
  try {
    const uploadPromises = files.map(file => uploadFileToWordPress(file, file.name));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('[DEBUG] Error uploading multiple files to WordPress:', error);
    throw error;
  }
}
