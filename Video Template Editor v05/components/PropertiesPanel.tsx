import React, { useState } from 'react';
import { Trash2, Settings, Sliders, Crop, Palette, Volume2, Move, RotateCcw, Edit2 } from 'lucide-react';
import { VideoAsset } from '../types/video';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface PropertiesPanelProps {
  currentVideo: VideoAsset | null;
  onVideoUpdate: (updates: Partial<VideoAsset>) => void;
  onVideoRemove: () => void;
}

export function PropertiesPanel({ currentVideo, onVideoUpdate, onVideoRemove }: PropertiesPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const DEFAULT_VALUES = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    volume: 1,
    speed: 1
  };

  const isDifferentFromDefault = (key: string, value: number) => {
    return Math.abs(value - DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES]) > 0.01;
  };

  const resetToDefault = (updates: Partial<VideoAsset>) => {
    onVideoUpdate(updates);
  };

  const handleNameEdit = () => {
    setEditedName(currentVideo?.name || '');
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editedName.trim() && currentVideo) {
      onVideoUpdate({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  if (!currentVideo) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div>
            <h3 className="text-sm">Properties</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a video to edit properties
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No video selected</p>
            <p className="text-xs mt-1 opacity-70">Add a video to the timeline to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm">Properties</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adjust video properties and effects
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoRemove}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Video Name */}
        <div className="mt-2">
          {isEditingName ? (
            <div className="flex items-center space-x-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-6 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') handleNameCancel();
                }}
                autoFocus
              />
              <Button variant="ghost" size="sm" onClick={handleNameSave} className="h-6 w-6 p-0">
                <Edit2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium truncate" title={currentVideo.name}>
                {currentVideo.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNameEdit}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="transform" className="h-full flex flex-col">
          {/* Tab Headers - Separate Container */}
          <div className="p-3 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform" className="text-xs px-1.5">
                <Move className="w-2.5 h-2.5 mr-1" />
                Transform
              </TabsTrigger>
              <TabsTrigger value="effects" className="text-xs px-1.5">
                <Palette className="w-2.5 h-2.5 mr-1" />
                Effects
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-xs px-1.5">
                <Volume2 className="w-2.5 h-2.5 mr-1" />
                Audio
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Separate Scrollable Container */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3">
                <TabsContent value="transform" className="space-y-4 mt-0">
                  {/* Position */}
                  <div className="space-y-3">
                    <Label className="text-xs">Position</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label className="w-3 text-xs">X</Label>
                        <div className="flex-1">
                          <Slider
                            value={[currentVideo.transform.x]}
                            onValueChange={([value]) => onVideoUpdate({ 
                              transform: { ...currentVideo.transform, x: value }
                            })}
                            min={-50}
                            max={50}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground w-6 text-right">
                            {currentVideo.transform.x.toFixed(1)}
                          </span>
                          {isDifferentFromDefault('x', currentVideo.transform.x) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetToDefault({ 
                                transform: { ...currentVideo.transform, x: DEFAULT_VALUES.x }
                              })}
                              className="h-5 w-5 p-0"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label className="w-3 text-xs">Y</Label>
                        <div className="flex-1">
                          <Slider
                            value={[currentVideo.transform.y]}
                            onValueChange={([value]) => onVideoUpdate({ 
                              transform: { ...currentVideo.transform, y: value }
                            })}
                            min={-50}
                            max={50}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground w-6 text-right">
                            {currentVideo.transform.y.toFixed(1)}
                          </span>
                          {isDifferentFromDefault('y', currentVideo.transform.y) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetToDefault({ 
                                transform: { ...currentVideo.transform, y: DEFAULT_VALUES.y }
                              })}
                              className="h-5 w-5 p-0"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Scale */}
                  <div className="space-y-2">
                    <Label className="text-xs">Scale</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform.scale]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, scale: value }
                          })}
                          min={0.1}
                          max={3}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {(currentVideo.transform.scale * 100).toFixed(0)}%
                        </span>
                        {isDifferentFromDefault('scale', currentVideo.transform.scale) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, scale: DEFAULT_VALUES.scale }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Rotation */}
                  <div className="space-y-2">
                    <Label className="text-xs">Rotation</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform.rotation]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, rotation: value }
                          })}
                          min={-180}
                          max={180}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {currentVideo.transform.rotation.toFixed(0)}°
                        </span>
                        {isDifferentFromDefault('rotation', currentVideo.transform.rotation) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, rotation: DEFAULT_VALUES.rotation }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Opacity */}
                  <div className="space-y-2">
                    <Label className="text-xs">Opacity</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.transform.opacity]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            transform: { ...currentVideo.transform, opacity: value }
                          })}
                          min={0}
                          max={1}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {(currentVideo.transform.opacity * 100).toFixed(0)}%
                        </span>
                        {isDifferentFromDefault('opacity', currentVideo.transform.opacity) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              transform: { ...currentVideo.transform, opacity: DEFAULT_VALUES.opacity }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="space-y-4 mt-0">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <Label className="text-xs">Brightness</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.brightness ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, brightness: value }
                          })}
                          min={-100}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {(currentVideo.effects?.brightness ?? 0).toFixed(0)}
                        </span>
                        {isDifferentFromDefault('brightness', currentVideo.effects?.brightness ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, brightness: DEFAULT_VALUES.brightness }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contrast */}
                  <div className="space-y-2">
                    <Label className="text-xs">Contrast</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.contrast ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, contrast: value }
                          })}
                          min={-100}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {(currentVideo.effects?.contrast ?? 0).toFixed(0)}
                        </span>
                        {isDifferentFromDefault('contrast', currentVideo.effects?.contrast ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, contrast: DEFAULT_VALUES.contrast }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Saturation */}
                  <div className="space-y-2">
                    <Label className="text-xs">Saturation</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.saturation ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, saturation: value }
                          })}
                          min={-100}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {(currentVideo.effects?.saturation ?? 0).toFixed(0)}
                        </span>
                        {isDifferentFromDefault('saturation', currentVideo.effects?.saturation ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, saturation: DEFAULT_VALUES.saturation }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Hue */}
                  <div className="space-y-2">
                    <Label className="text-xs">Hue</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.effects?.hue ?? 0]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            effects: { ...currentVideo.effects, hue: value }
                          })}
                          min={-180}
                          max={180}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {(currentVideo.effects?.hue ?? 0).toFixed(0)}°
                        </span>
                        {isDifferentFromDefault('hue', currentVideo.effects?.hue ?? 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              effects: { ...currentVideo.effects, hue: DEFAULT_VALUES.hue }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4 mt-0">
                  {/* Volume */}
                  <div className="space-y-2">
                    <Label className="text-xs">Volume</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.audio?.volume ?? 1]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            audio: { ...currentVideo.audio, volume: value }
                          })}
                          min={0}
                          max={2}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {((currentVideo.audio?.volume ?? 1) * 100).toFixed(0)}%
                        </span>
                        {isDifferentFromDefault('volume', currentVideo.audio?.volume ?? 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              audio: { ...currentVideo.audio, volume: DEFAULT_VALUES.volume }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Speed */}
                  <div className="space-y-2">
                    <Label className="text-xs">Speed</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Slider
                          value={[currentVideo.audio?.speed ?? 1]}
                          onValueChange={([value]) => onVideoUpdate({ 
                            audio: { ...currentVideo.audio, speed: value }
                          })}
                          min={0.25}
                          max={4}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground w-6 text-right">
                          {(currentVideo.audio?.speed ?? 1).toFixed(2)}x
                        </span>
                        {isDifferentFromDefault('speed', currentVideo.audio?.speed ?? 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetToDefault({ 
                              audio: { ...currentVideo.audio, speed: DEFAULT_VALUES.speed }
                            })}
                            className="h-5 w-5 p-0"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Mute Toggle */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Mute</Label>
                    <Switch
                      checked={currentVideo.audio?.muted ?? false}
                      onCheckedChange={(muted) => onVideoUpdate({ 
                        audio: { ...currentVideo.audio, muted }
                      })}
                    />
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
}