import { NextResponse } from 'next/server';
import { uploadFileToWordPress } from '@/lib/wordpress-media';

// Maximum file size in bytes (64MB)
const MAX_FILE_SIZE = 64 * 1024 * 1024;

export async function POST(request: Request) {
  console.log('[DEBUG] Media upload request received');
  
  try {
    // Check content length before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      console.log('[DEBUG] Request too large:', contentLength);
      return NextResponse.json(
        {
          success: false,
          error: `Request size exceeds the maximum allowed (64MB)`
        },
        { status: 413 }
      );
    }
    
    // Parse the form data manually
    const formData = await request.formData();
    console.log('[DEBUG] Form data parsed successfully');
    
    // Get the file from the form data
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      );
    }
    
    console.log('[DEBUG] File found:', { 
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the maximum allowed (64MB)`
        },
        { status: 413 }
      );
    }
    
    try {
      // Upload file to WordPress media library
      console.log('[DEBUG] Uploading file to WordPress media library');
      const mediaData = await uploadFileToWordPress(file, file.name);
      
      // Return the media data
      return NextResponse.json({
        success: true,
        mediaId: mediaData.id,
        mediaUrl: mediaData.source_url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
    } catch (uploadError: any) {
      console.error('[DEBUG] Error uploading file to WordPress:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Error uploading file: ${uploadError.message}`
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('[DEBUG] Error processing upload request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process upload request'
      },
      { status: 500 }
    );
  }
}
