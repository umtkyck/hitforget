"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Power, RefreshCw, Maximize2, Minimize2 } from "lucide-react";

interface SerialConsoleProps {
  deviceId: string;
}

export function SerialConsole({ deviceId }: SerialConsoleProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [baudRate, setBaudRate] = useState("115200");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#d4d4d4",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#e5e5e5",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    fitAddonRef.current = fitAddon;

    term.writeln("Welcome to Visucan Serial Console");
    term.writeln("Connecting to device...");

    setTerminal(term);

    // Cleanup
    return () => {
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (!terminal) return;

    // Connect WebSocket
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/devices/${deviceId}/console?baudRate=${baudRate}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      terminal.writeln("\r\n✓ Connected to device");
      terminal.writeln(`Baud rate: ${baudRate}`);
      terminal.writeln("---");
    };

    websocket.onmessage = (event) => {
      terminal.write(event.data);
    };

    websocket.onerror = (error) => {
      terminal.writeln("\r\n✗ Connection error");
      setIsConnected(false);
    };

    websocket.onclose = () => {
      terminal.writeln("\r\n✗ Disconnected");
      setIsConnected(false);
    };

    // Send data from terminal to WebSocket
    const disposable = terminal.onData((data) => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(data);
      }
    });

    setWs(websocket);

    return () => {
      disposable.dispose();
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [terminal, deviceId, baudRate]);

  const handleClear = () => {
    terminal?.clear();
  };

  const handleReset = () => {
    terminal?.reset();
    terminal?.writeln("Terminal reset");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
  };

  return (
    <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Serial Console
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={baudRate} onValueChange={setBaudRate}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9600">9600</SelectItem>
                <SelectItem value="19200">19200</SelectItem>
                <SelectItem value="38400">38400</SelectItem>
                <SelectItem value="57600">57600</SelectItem>
                <SelectItem value="115200">115200</SelectItem>
                <SelectItem value="230400">230400</SelectItem>
                <SelectItem value="460800">460800</SelectItem>
                <SelectItem value="921600">921600</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" />
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
        <div
          ref={terminalRef}
          className={`rounded-md ${isFullscreen ? "h-[calc(100vh-12rem)]" : "h-96"}`}
        />
      </CardContent>
    </Card>
  );
}
