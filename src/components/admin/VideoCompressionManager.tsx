import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Video, Zap, FileDown, CheckCircle } from 'lucide-react';

interface VideoFile {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_optimized: boolean;
  video_quality: string;
}

interface CompressionJob {
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  originalSize?: string;
  compressedSize?: string;
  compressionRatio?: string;
}

const VideoCompressionManager = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [compressionJobs, setCompressionJobs] = useState<Map<string, CompressionJob>>(new Map());
  const [selectedQuality, setSelectedQuality] = useState<string>('medium');
  const [maxSizeMB, setMaxSizeMB] = useState<string>('10');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('id, title, file_path, file_size, mime_type, is_optimized, video_quality')
        .like('mime_type', 'video/%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Kunde inte ladda videor');
    } finally {
      setLoading(false);
    }
  };

  const compressVideo = async (video: VideoFile) => {
    const jobId = video.id;
    
    // Update job status
    setCompressionJobs(prev => new Map(prev.set(jobId, {
      videoId: video.id,
      status: 'processing',
      progress: 0
    })));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCompressionJobs(prev => {
          const job = prev.get(jobId);
          if (job && job.progress < 90) {
            return new Map(prev.set(jobId, {
              ...job,
              progress: job.progress + 10
            }));
          }
          return prev;
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke('compress-video', {
        body: {
          action: 'compress',
          videoPath: video.file_path,
          quality: selectedQuality,
          maxSizeMB: parseInt(maxSizeMB)
        }
      });

      clearInterval(progressInterval);

      if (error) throw error;

      if (data.success) {
        setCompressionJobs(prev => new Map(prev.set(jobId, {
          videoId: video.id,
          status: 'completed',
          progress: 100,
          originalSize: data.original_size,
          compressedSize: data.compressed_size,
          compressionRatio: data.compression_ratio
        })));

        toast.success(`Video komprimerad! Storleken minskad med ${data.compression_ratio}`);
        
        // Refresh videos list
        await fetchVideos();
      } else {
        throw new Error(data.error || 'Komprimering misslyckades');
      }

    } catch (error) {
      console.error('Compression error:', error);
      setCompressionJobs(prev => new Map(prev.set(jobId, {
        videoId: video.id,
        status: 'failed',
        progress: 0
      })));
      toast.error(`Komprimering misslyckades: ${error.message}`);
    }
  };

  const compressAllVideos = async () => {
    const uncompressedVideos = videos.filter(v => !v.is_optimized && v.file_size > 10 * 1024 * 1024);
    
    if (uncompressedVideos.length === 0) {
      toast.info('Inga videor behöver komprimeras');
      return;
    }

    toast.info(`Startar komprimering av ${uncompressedVideos.length} videor...`);
    
    // Process videos one by one to avoid overwhelming the system
    for (const video of uncompressedVideos) {
      await compressVideo(video);
      // Small delay between compressions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionJob = (videoId: string) => compressionJobs.get(videoId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Laddar videor...</span>
      </div>
    );
  }

  const largeVideos = videos.filter(v => v.file_size > 5 * 1024 * 1024);
  const uncompressedVideos = videos.filter(v => !v.is_optimized && v.file_size > 10 * 1024 * 1024);
  const totalSavings = videos
    .filter(v => v.is_optimized)
    .reduce((acc, v) => acc + (v.file_size * 0.5), 0); // Estimate savings

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Totala videor</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Stora videor (&gt;5MB)</p>
                <p className="text-2xl font-bold text-orange-600">{largeVideos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Optimerade</p>
                <p className="text-2xl font-bold text-green-600">
                  {videos.filter(v => v.is_optimized).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileDown className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Uppskattat sparat</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatFileSize(totalSavings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compression Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Komprimerings-inställningar</CardTitle>
          <CardDescription>
            Konfigurera kvalitet och maximal filstorlek för videokomprimering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Kvalitet</label>
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hög (70% av original)</SelectItem>
                  <SelectItem value="medium">Medium (50% av original)</SelectItem>
                  <SelectItem value="low">Låg (30% av original)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Max storlek (MB)</label>
              <Select value={maxSizeMB} onValueChange={setMaxSizeMB}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 MB</SelectItem>
                  <SelectItem value="10">10 MB</SelectItem>
                  <SelectItem value="15">15 MB</SelectItem>
                  <SelectItem value="20">20 MB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={compressAllVideos}
                disabled={uncompressedVideos.length === 0}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Komprimera alla ({uncompressedVideos.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      <Card>
        <CardHeader>
          <CardTitle>Video-filer</CardTitle>
          <CardDescription>
            Hantera och komprimera videor för att minska bandwidth-kostnader
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videos.map((video) => {
              const job = getCompressionJob(video.id);
              const isLarge = video.file_size > 10 * 1024 * 1024;
              
              return (
                <div key={video.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Video className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{video.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(video.file_size)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {video.is_optimized && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Optimerad
                            </Badge>
                          )}
                          
                          {isLarge && !video.is_optimized && (
                            <Badge variant="destructive">
                              Stor fil
                            </Badge>
                          )}
                          
                          {video.video_quality && (
                            <Badge variant="outline">
                              {video.video_quality}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {job && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>
                              {job.status === 'processing' && 'Komprimerar...'}
                              {job.status === 'completed' && 'Klar!'}
                              {job.status === 'failed' && 'Misslyckades'}
                            </span>
                            {job.compressionRatio && (
                              <span className="text-green-600 font-medium">
                                Sparade {job.compressionRatio}
                              </span>
                            )}
                          </div>
                          <Progress value={job.progress} className="h-2" />
                          {job.originalSize && job.compressedSize && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {job.originalSize} → {job.compressedSize}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {!video.is_optimized && !job && (
                        <Button
                          size="sm"
                          onClick={() => compressVideo(video)}
                          disabled={!!job}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Komprimera
                        </Button>
                      )}
                      
                      {job?.status === 'processing' && (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Bearbetar...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {videos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Inga videor hittades
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoCompressionManager;