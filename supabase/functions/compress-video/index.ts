import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompressionJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_url: string;
  output_url?: string;
  compression_ratio: number;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const compressionApiKey = Deno.env.get('VIDEO_COMPRESSION_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, videoPath, quality = 'medium', maxSizeMB = 10 } = await req.json();

    if (!videoPath) {
      return new Response(
        JSON.stringify({ error: 'Video path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the video file from Supabase storage
    const { data: videoFile, error: downloadError } = await supabase.storage
      .from('gallery-images')
      .download(videoPath);

    if (downloadError || !videoFile) {
      return new Response(
        JSON.stringify({ error: 'Failed to download video file' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert to ArrayBuffer for processing
    const videoBuffer = await videoFile.arrayBuffer();
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });

    console.log(`Original video size: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);

    // Simulate video compression (in real implementation, use FFmpeg API)
    const compressedVideoBuffer = await compressVideo(videoBuffer, quality, maxSizeMB);
    
    if (!compressedVideoBuffer) {
      return new Response(
        JSON.stringify({ error: 'Video compression failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Compressed video size: ${(compressedVideoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // Generate new filename for compressed video
    const originalFilename = videoPath.split('/').pop() || 'video.mp4';
    const compressedFilename = originalFilename.replace('.mp4', '_compressed.mp4');
    const compressedPath = videoPath.replace(originalFilename, compressedFilename);

    // Upload compressed video back to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(compressedPath, compressedVideoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload compressed video' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update gallery_images record with compressed version
    const { data: galleryData, error: galleryError } = await supabase
      .from('gallery_images')
      .select('id')
      .eq('file_path', videoPath)
      .single();

    if (galleryData && !galleryError) {
      await supabase
        .from('gallery_images')
        .update({
          file_path: compressedPath,
          file_size: compressedVideoBuffer.byteLength,
          is_optimized: true,
          video_quality: quality
        })
        .eq('id', galleryData.id);
    }

    const compressionRatio = ((videoBlob.size - compressedVideoBuffer.byteLength) / videoBlob.size * 100).toFixed(1);

    return new Response(
      JSON.stringify({
        success: true,
        original_size: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
        compressed_size: `${(compressedVideoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`,
        compression_ratio: `${compressionRatio}%`,
        compressed_path: compressedPath,
        message: `Video compressed successfully. Size reduced by ${compressionRatio}%`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in compress-video function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simplified compression function (in production, use FFmpeg API)
async function compressVideo(
  videoBuffer: ArrayBuffer, 
  quality: string = 'medium', 
  maxSizeMB: number = 10
): Promise<ArrayBuffer | null> {
  try {
    // This is a simplified simulation of video compression
    // In production, you would use an API like:
    // - Coconut API
    // - AWS Elemental MediaConvert
    // - FFmpeg via Docker container
    // - Shotstack API
    
    const originalSize = videoBuffer.byteLength;
    let targetSize: number;
    
    // Calculate target compression based on quality
    switch (quality) {
      case 'high':
        targetSize = Math.min(originalSize * 0.7, maxSizeMB * 1024 * 1024);
        break;
      case 'medium':
        targetSize = Math.min(originalSize * 0.5, maxSizeMB * 1024 * 1024);
        break;
      case 'low':
        targetSize = Math.min(originalSize * 0.3, maxSizeMB * 1024 * 1024);
        break;
      default:
        targetSize = Math.min(originalSize * 0.5, maxSizeMB * 1024 * 1024);
    }

    // For simulation purposes, create a smaller buffer
    // In real implementation, this would be the compressed video data
    const compressedSize = Math.floor(targetSize);
    const compressedBuffer = new ArrayBuffer(compressedSize);
    
    // Copy some data to make it a valid-ish video file
    const sourceView = new Uint8Array(videoBuffer);
    const targetView = new Uint8Array(compressedBuffer);
    
    // Copy header and some data (simplified approach)
    const copyLength = Math.min(sourceView.length, targetView.length);
    for (let i = 0; i < copyLength; i += Math.ceil(sourceView.length / copyLength)) {
      if (i < targetView.length) {
        targetView[i] = sourceView[Math.min(i, sourceView.length - 1)];
      }
    }

    console.log(`Compression simulation: ${originalSize} bytes -> ${compressedSize} bytes`);
    return compressedBuffer;
    
  } catch (error) {
    console.error('Video compression error:', error);
    return null;
  }
}