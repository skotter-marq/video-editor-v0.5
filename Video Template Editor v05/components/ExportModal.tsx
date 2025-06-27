import React, { useState, useEffect } from 'react';
import { Download, Settings, Film, CheckCircle, AlertCircle } from 'lucide-react';
import { VideoProject } from '../types/video';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';

interface ExportModalProps {
  project: VideoProject;
  onExport: (settings: ExportSettings) => void;
}

interface ExportSettings {
  quality: '720p' | '1080p' | '4K';
  format: 'mp4' | 'mov' | 'webm';
  framerate: number;
  compression: 'high' | 'medium' | 'low';
}

export function ExportModal({ project, onExport }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<ExportSettings>({
    quality: '1080p',
    format: 'mp4',
    framerate: 30,
    compression: 'medium'
  });

  const qualityOptions = [
    { value: '720p', label: '720p HD', description: '1280 x 720', size: '~50MB' },
    { value: '1080p', label: '1080p Full HD', description: '1920 x 1080', size: '~100MB' },
    { value: '4K', label: '4K Ultra HD', description: '3840 x 2160', size: '~400MB' }
  ];

  const formatOptions = [
    { value: 'mp4', label: 'MP4', description: 'Best compatibility' },
    { value: 'mov', label: 'MOV', description: 'High quality' },
    { value: 'webm', label: 'WebM', description: 'Web optimized' }
  ];

  const compressionOptions = [
    { value: 'high', label: 'High Quality', description: 'Larger file size' },
    { value: 'medium', label: 'Balanced', description: 'Good quality, reasonable size' },
    { value: 'low', label: 'Compressed', description: 'Smaller file size' }
  ];

  const resetExportState = () => {
    setIsExporting(false);
    setExportProgress(0);
    setExportComplete(false);
    setExportError(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    try {
      // Simulate export process
      const stages = [
        'Preparing video...',
        'Processing frames...',
        'Encoding video...',
        'Applying effects...',
        'Finalizing export...'
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setExportProgress(((i + 1) / stages.length) * 100);
      }

      // Simulate potential error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Export failed: Insufficient memory');
      }

      setExportComplete(true);
      onExport(settings);
      
      // Auto-close modal after successful export
      setTimeout(() => {
        setIsOpen(false);
        resetExportState();
      }, 2000);

    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setIsOpen(false);
      resetExportState();
    }
  };

  const getEstimatedSize = () => {
    const baseSizes = { '720p': 50, '1080p': 100, '4K': 400 };
    const compressionMultipliers = { high: 1.5, medium: 1, low: 0.6 };
    
    const baseSize = baseSizes[settings.quality];
    const multiplier = compressionMultipliers[settings.compression];
    const totalDuration = project.videos.reduce((acc, video) => 
      acc + (video.position.endTime - video.position.startTime), 0
    );
    
    return Math.round(baseSize * multiplier * (totalDuration / 60));
  };

  const getEstimatedTime = () => {
    const totalDuration = project.videos.reduce((acc, video) => 
      acc + (video.position.endTime - video.position.startTime), 0
    );
    
    const processingRates = { '720p': 4, '1080p': 2, '4K': 0.5 };
    const rate = processingRates[settings.quality];
    
    return Math.ceil(totalDuration / rate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center space-x-2"
          disabled={project.videos.length === 0}
        >
          <Download className="w-4 h-4" />
          <span>Export Video</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Film className="w-5 h-5" />
            <span>Export Video Template</span>
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and download your video template in the desired format and quality.
          </DialogDescription>
        </DialogHeader>

        {!isExporting && !exportComplete && !exportError && (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="mb-2">{project.name}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Dimensions: {project.dimensions.width} x {project.dimensions.height}</div>
                <div>Videos: {project.videos.length}</div>
                <div>Total Duration: {Math.floor(project.videos.reduce((acc, video) => 
                  acc + (video.position.endTime - video.position.startTime), 0
                ) / 60)}:{Math.floor(project.videos.reduce((acc, video) => 
                  acc + (video.position.endTime - video.position.startTime), 0
                ) % 60).toString().padStart(2, '0')}</div>
              </div>
            </div>

            {/* Quality Settings */}
            <div className="space-y-3">
              <Label>Video Quality</Label>
              <RadioGroup
                value={settings.quality}
                onValueChange={(quality: '720p' | '1080p' | '4K') =>
                  setSettings({ ...settings, quality })
                }
              >
                {qualityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{option.size}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Format Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(format: 'mp4' | 'mov' | 'webm') =>
                    setSettings({ ...settings, format })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Frame Rate</Label>
                <Select
                  value={settings.framerate.toString()}
                  onValueChange={(framerate) =>
                    setSettings({ ...settings, framerate: parseInt(framerate) })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Compression Settings */}
            <div className="space-y-3">
              <Label>Compression</Label>
              <RadioGroup
                value={settings.compression}
                onValueChange={(compression: 'high' | 'medium' | 'low') =>
                  setSettings({ ...settings, compression })
                }
              >
                {compressionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`compression-${option.value}`} />
                    <Label htmlFor={`compression-${option.value}`} className="cursor-pointer">
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Export Summary */}
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="mb-2">Export Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Estimated File Size:</span>
                  <span>~{getEstimatedSize()}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>~{getEstimatedTime()}min</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Format:</span>
                  <span>{settings.format.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </div>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 animate-spin text-primary" />
            </div>
            
            <div className="space-y-3">
              <h4>Exporting Video Template</h4>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {exportProgress < 100 ? `${Math.round(exportProgress)}% complete` : 'Finalizing...'}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              This may take a few minutes depending on video length and quality settings.
            </p>
          </div>
        )}

        {/* Export Complete */}
        {exportComplete && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h4>Export Complete!</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Your video template has been exported successfully.
              </p>
            </div>
            
            <Button onClick={() => handleClose()} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        )}

        {/* Export Error */}
        {exportError && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h4>Export Failed</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {exportError}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleClose()} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => {
                setExportError(null);
                handleExport();
              }} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}