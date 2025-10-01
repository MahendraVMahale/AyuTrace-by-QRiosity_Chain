"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProcessorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lotId: "",
    processorId: "",
    processType: "drying",
    inputQuantityKg: "",
    outputQuantityKg: "",
    processDate: new Date().toISOString().split("T")[0],
    temperature: "",
    duration: "",
    equipment: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }
    
    const role = (session.user as any).role;
    if (role !== "PROCESSOR" && role !== "ADMIN") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          inputQuantityKg: parseFloat(formData.inputQuantityKg),
          outputQuantityKg: parseFloat(formData.outputQuantityKg),
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          location: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Processing event recorded successfully! ✓");
        router.push("/");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error: any) {
      alert("Failed to connect to API: " + error.message);
    } finally {
      setLoading(false);
    }
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Processing</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Record processing stages: drying, grinding, extraction, etc.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lotId">Lot ID *</Label>
                <Input
                  id="lotId"
                  required
                  value={formData.lotId}
                  onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                  placeholder="TURMERIC-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="processorId">Processor ID *</Label>
                <Input
                  id="processorId"
                  required
                  value={formData.processorId}
                  onChange={(e) => setFormData({ ...formData, processorId: e.target.value })}
                  placeholder="PROC-001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="processType">Process Type *</Label>
              <select
                id="processType"
                className="w-full border rounded-md p-2 bg-white dark:bg-gray-800"
                value={formData.processType}
                onChange={(e) => setFormData({ ...formData, processType: e.target.value })}
              >
                <option value="cleaning">Cleaning</option>
                <option value="drying">Drying</option>
                <option value="grinding">Grinding</option>
                <option value="extraction">Extraction</option>
                <option value="decoction">Decoction</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inputQuantityKg">Input Quantity (kg) *</Label>
                <Input
                  id="inputQuantityKg"
                  type="number"
                  step="0.01"
                  required
                  value={formData.inputQuantityKg}
                  onChange={(e) => setFormData({ ...formData, inputQuantityKg: e.target.value })}
                  placeholder="100.00"
                />
              </div>
              <div>
                <Label htmlFor="outputQuantityKg">Output Quantity (kg) *</Label>
                <Input
                  id="outputQuantityKg"
                  type="number"
                  step="0.01"
                  required
                  value={formData.outputQuantityKg}
                  onChange={(e) => setFormData({ ...formData, outputQuantityKg: e.target.value })}
                  placeholder="85.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="processDate">Process Date *</Label>
              <Input
                id="processDate"
                type="date"
                required
                value={formData.processDate}
                onChange={(e) => setFormData({ ...formData, processDate: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="60.0"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="120"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                placeholder="Industrial dryer model XYZ"
              />
            </div>

            <div>
              <Label>Facility Location *</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <Input
                  placeholder="Latitude"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
                <Input
                  placeholder="Longitude"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Recording..." : "Record Processing Event"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}