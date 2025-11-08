"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Play, Square, RotateCw, Download, Trash2 } from "lucide-react";

export default function VirtualConsolePagePage() {
  const params = useParams();
  const instanceId = params.id as string;

  const [instance, setInstance] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstanceDetails();

    return () => {
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [instanceId]);

  useEffect(() => {
    // Auto-scroll to bottom when new output arrives
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const fetchInstanceDetails = async () => {
    try {
      const response = await fetch(`/api/virtual-instances/${instanceId}`);
      const data = await response.json();

      if (data.success) {
        setInstance(data.instance);

        // Auto-connect if instance is running
        if (data.instance.status === "running") {
          connectWebSocket();
        }
      }
    } catch (error) {
      console.error("Error fetching instance:", error);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Connect to WebSocket serial console
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:3001/virtual-processors/instances/${instanceId}/serial`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setOutput((prev) => [...prev, "=== Connected to virtual processor ==="]);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "history") {
          // Initial history
          if (message.data) {
            setOutput((prev) => [...prev, ...message.data.split("\n")]);
          }
        } else if (message.type === "output") {
          // New output
          const lines = message.data.split("\n");
          setOutput((prev) => [...prev, ...lines.filter((l: string) => l.length > 0)]);
        } else if (message.error) {
          setOutput((prev) => [...prev, `Error: ${message.error}`]);
        }
      } catch (e) {
        // Plain text message
        setOutput((prev) => [...prev, event.data]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setOutput((prev) => [...prev, "=== WebSocket error ==="]);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      setOutput((prev) => [...prev, "=== Disconnected from virtual processor ==="]);
    };

    wsRef.current = ws;
  };

  const sendCommand = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Display the command in the output
    setOutput((prev) => [...prev, `> ${input}`]);

    // Send to WebSocket
    wsRef.current.send(input + "\n");

    // Clear input
    setInput("");
  };

  const handleControl = async (action: string) => {
    try {
      const response = await fetch(`/api/virtual-instances/${instanceId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput((prev) => [...prev, `=== Instance ${action}ed successfully ===`]);
        await fetchInstanceDetails();

        if (action === "start") {
          setTimeout(() => connectWebSocket(), 1000);
        } else if (action === "stop") {
          if (wsRef.current) {
            wsRef.current.close();
          }
        }
      } else {
        setOutput((prev) => [...prev, `Error: ${data.error}`]);
      }
    } catch (error) {
      console.error("Error controlling instance:", error);
      setOutput((prev) => [...prev, "=== Failed to control instance ==="]);
    }
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const downloadOutput = () => {
    const blob = new Blob([output.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `console-${instanceId}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!instance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Serial Console</h1>
          <p className="text-muted-foreground">
            {instance.name} • {instance.processorType?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant={instance.status === "running" ? "default" : "secondary"}>
            {instance.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Main Console */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <CardTitle>Terminal Output</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadOutput}
                  disabled={output.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={clearOutput}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Terminal Output */}
            <div
              ref={outputRef}
              className="bg-black text-green-400 font-mono text-sm p-4 h-[500px] overflow-y-auto"
            >
              {output.length === 0 ? (
                <div className="text-gray-500">
                  Waiting for output... {!connected && "(Not connected)"}
                </div>
              ) : (
                output.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line}
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendCommand} className="border-t bg-muted p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    connected
                      ? "Type command and press Enter..."
                      : "Not connected"
                  }
                  disabled={!connected}
                  className="flex-grow px-3 py-2 bg-background border rounded-md font-mono text-sm disabled:opacity-50"
                />
                <Button type="submit" disabled={!connected || !input.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Manage virtual processor</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {instance.status !== "running" ? (
              <Button
                className="w-full gap-2"
                onClick={() => handleControl("start")}
              >
                <Play className="h-4 w-4" />
                Start Instance
              </Button>
            ) : (
              <Button
                className="w-full gap-2"
                variant="destructive"
                onClick={() => handleControl("stop")}
              >
                <Square className="h-4 w-4" />
                Stop Instance
              </Button>
            )}

            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => handleControl("restart")}
              disabled={instance.status !== "running"}
            >
              <RotateCw className="h-4 w-4" />
              Restart
            </Button>

            <div className="pt-4 border-t">
              <div className="text-sm font-semibold mb-2">Connection</div>
              {connected ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    if (wsRef.current) wsRef.current.close();
                  }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={connectWebSocket}
                  disabled={instance.status !== "running"}
                >
                  Connect
                </Button>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm font-semibold mb-2">Quick Links</div>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/virtual-instances/${instanceId}`)}
                >
                  Instance Settings
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/virtual-instances`)}
                >
                  All Instances
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• The virtual processor must be running to connect to the serial console</p>
          <p>• Serial output is displayed in real-time as your firmware executes</p>
          <p>• Use the input box to send commands to your running firmware</p>
          <p>• Download the console output for debugging or documentation</p>
        </CardContent>
      </Card>
    </div>
  );
}
