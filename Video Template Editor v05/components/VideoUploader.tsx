import React, { useCallback, useState } from 'react';
import { Upload, Film, Clock, Plus, Check } from 'lucide-react';
import { VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface VideoUploaderProps {
  onVideoUpload: (video: VideoAsset) => void;
  uploadedVideos: VideoAsset[];
  onAddToTimeline?: (video: VideoAsset) => void;
  timelineVideos: VideoAsset[];
}

export function VideoUploader({ 
  onVideoUpload, 
  uploadedVideos, 
  onAddToTimeline,
  timelineVideos 
}: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList) => {
    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('video/')) {
        try {
          // Create video element to get dimensions and duration
          const video = document.createElement('video');
          const url = URL.createObjectURL(file);
          
          await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
              // Generate thumbnail
              const canvas = document.createElement('canvas');
              const aspectRatio = video.videoWidth / video.videoHeight;
              canvas.width = 320;
              canvas.height = 320 / aspectRatio;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // Set video time to get a frame
                video.currentTime = Math.min(1, video.duration * 0.1);
                video.onseeked = () => {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
                  
                  const videoAsset: VideoAsset = {
                    id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    duration: video.duration,
                    size: file.size,
                    type: file.type,
                    url: url,
                    thumbnail: thumbnail,
                    position: {
                      startTime: 0,
                      endTime: video.duration,
                      x: 0,
                      y: 0
                    },
                    transform: {
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotation: 0,
                      opacity: 1
                    }
                  };
                  
                  onVideoUpload(videoAsset);
                  resolve(null);
                };
              }
            };
            video.onerror = reject;
            video.src = url;
          });
        } catch (error) {
          console.error('Error processing video:', error);
        }
      }
    }
    
    setIsUploading(false);
  }, [onVideoUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragStart = (e: React.DragEvent, video: VideoAsset) => {
    e.dataTransfer.setData('video-id', video.id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOnTimeline = (videoId: string) => {
    return timelineVideos.some(v => v.id === videoId);
  };

  return (
    <div 
      className={`h-full flex flex-col ${isDragOver ? 'bg-primary/5' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm">Video Library</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload and manage your video assets
            </p>
          </div>
          
          {/* Upload Button */}
          <div className="relative ml-2 flex-shrink-0">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button 
              variant="default" 
              size="sm"
              disabled={isUploading}
              className="rounded-full h-7 w-7 p-0"
            >
              {isUploading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area - Conditional like Properties Panel */}
      {uploadedVideos.length === 0 ? (
        /* Empty State - Same structure as Properties Panel */
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="text-muted-foreground">
            <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No videos uploaded yet</p>
            <p className="text-xs mt-1 opacity-70">Click the upload button or drag files here</p>
          </div>
        </div>
      ) : (
        /* Video List */
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="space-y-1.5">
                {uploadedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative bg-card rounded-lg border border-border hover:border-border/80 transition-all cursor-move shadow-sm hover:shadow-md overflow-hidden"
                    draggable
                    onDragStart={(e) => handleDragStart(e, video)}
                  >
                    <div className="flex items-center p-2 min-w-0">
                      {/* Compact Thumbnail */}
                      <div className="relative w-12 h-8 rounded overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-3 h-3 bg-white/90 rounded-full flex items-center justify-center">
                            <Film className="w-2 h-2 text-black" />
                          </div>
                        </div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-0 right-0">
                          <Badge variant="secondary" className="text-xs px-0.5 py-0 bg-black/80 text-white border-0 h-3 text-xs leading-none">
                            {formatDuration(video.duration)}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content - Ultra compact */}
                      <div className="ml-2 flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between">
                          {/* Title - Very strict width */}
                          <div className="flex-1 min-w-0 max-w-[140px]">
                            <h4 className="text-xs font-medium truncate" title={video.name}>
                              {video.name}
                            </h4>
                          </div>
                          
                          {/* Timeline Status & Actions */}
                          <div className="ml-1 flex-shrink-0">
                            {isOnTimeline(video.id) ? (
                              <Badge variant="secondary" className="text-xs px-1 py-0 h-3.5 whitespace-nowrap">
                                <Check className="w-2 h-2" />
                              </Badge>
                            ) : (
                              onAddToTimeline && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onAddToTimeline(video)}
                                  className="h-3.5 w-3.5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="w-2 h-2" />
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                        
                        {/* Metadata - Single line */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center flex-shrink-0">
                            <Clock className="w-2 h-2 mr-0.5" />
                            <span className="text-xs">{formatDuration(video.duration)}</span>
                          </span>
                          <span className="truncate ml-1 text-xs max-w-[50px]">{formatFileSize(video.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}