"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"

interface QrScannerProps {
  onScan: (data: string) => void
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerInstance) {
        scannerInstance.stop().catch(console.error)
      }
    }
  }, [scannerInstance])

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader")
      setScannerInstance(html5QrCode)

      const qrCodeSuccessCallback = (decodedText: string) => {
        onScan(decodedText)
        stopScanner()
      }

      const config = { fps: 10, qrbox: { width: 250, height: 250 } }

      await html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined)

      setIsScanning(true)
    } catch (err) {
      console.error("Error starting QR scanner:", err)
    }
  }

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.stop().catch(console.error)
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden"></div>

      {!isScanning ? (
        <Button onClick={startScanner} className="w-full" size="lg">
          Iniciar Escáner
        </Button>
      ) : (
        <Button onClick={stopScanner} variant="outline" className="w-full" size="lg">
          Detener Escáner
        </Button>
      )}
    </div>
  )
}

