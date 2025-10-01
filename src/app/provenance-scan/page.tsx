"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProvenanceScanPage() {
  const router = useRouter();
  const [packId, setPackId] = useState("");

  const handleScan = () => {
    if (packId.trim()) {
      router.push(`/provenance/${packId.trim()}`);
    }
  };

  const handleDemoScan = () => {
    // Use a demo pack ID for testing
    router.push(`/provenance/PACK-DEMO-001`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="container mx-auto">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <QrCode className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Scan QR Code</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Verify the complete journey of your Ayurvedic product
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="packId">Enter Pack ID</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="packId"
                  placeholder="PACK-XXXX-XXXX"
                  value={packId}
                  onChange={(e) => setPackId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleScan()}
                />
                <Button onClick={handleScan} disabled={!packId.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                In a production environment, this would use camera access to scan QR codes
              </p>
              <Button variant="outline" onClick={handleDemoScan} className="w-full">
                Try Demo Pack
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">What you'll see:</h3>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Complete collection history with geo-location</li>
                <li>• All processing stages and methods</li>
                <li>• Quality test results and certifications</li>
                <li>• Blockchain verification status</li>
                <li>• Compliance report</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by blockchain technology</p>
          <p className="mt-1">Ministry of AYUSH · Government of India</p>
        </div>
      </main>
    </div>
  );
}