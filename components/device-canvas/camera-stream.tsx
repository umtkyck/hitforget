"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Maximize2, Minimize2, Download } from "lucide-react";

interface CameraStreamProps {
  deviceId: string;
}

export function CameraStream({ deviceId }: CameraStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize WebRTC
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection.iceConnectionState === 'disconnected') {
        setIsConnected(false);
      }
    };

    // Connect to signaling server
    connectToSignalingServer(peerConnection, deviceId);

    setPc(peerConnection);

    return () => {
      peerConnection.close();
    };
  }, [deviceId]);

  async function connectToSignalingServer(pc: RTCPeerConnection, deviceId: string) {
    try {
      // Request camera stream from device
      const response = await fetch(`/api/devices/${deviceId}/camera/offer`, {
        method: 'POST',
      });

      const { offer } = await response.json();

      if (offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer back to device
        await fetch(`/api/devices/${deviceId}/camera/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer }),
        });
      }
    } catch (error) {
      console.error('Error connecting to camera:', error);
    }
  }

  const handleSnapshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snapshot-${deviceId}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && videoRef.current) {
      videoRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Device Camera
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSnapshot}>
              <Download className="h-4 w-4 mr-1" />
              Snapshot
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md overflow-hidden bg-black">
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Connecting to camera...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full ${isFullscreen ? "h-[calc(100vh-12rem)]" : "aspect-video"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
