"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CollectorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lotId: "",
    collectorId: "",
    species: "",
    commonName: "",
    partUsed: "root",
    quantityKg: "",
    collectionDate: new Date().toISOString().split("T")[0],
    lat: "",
    lng: "",
    weatherConditions: "",
    soilType: "",
    wildHarvested: false,
    organicCertified: false,
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }
    
    const role = (session.user as any).role;
    if (role !== "COLLECTOR" && role !== "ADMIN") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
        },
        (error) => {
          alert("Unable to get location: " + error.message);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantityKg: parseFloat(formData.quantityKg),
          location: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Collection event recorded successfully! ✓");
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
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">Field Collection</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Record herbal collection events with geo-location and botanical data
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
                <Label htmlFor="collectorId">Collector ID *</Label>
                <Input
                  id="collectorId"
                  required
                  value={formData.collectorId}
                  onChange={(e) => setFormData({ ...formData, collectorId: e.target.value })}
                  placeholder="COL-001"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="species">Botanical Name *</Label>
                <Input
                  id="species"
                  required
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  placeholder="Curcuma longa"
                />
              </div>
              <div>
                <Label htmlFor="commonName">Common Name *</Label>
                <Input
                  id="commonName"
                  required
                  value={formData.commonName}
                  onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                  placeholder="Turmeric"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partUsed">Part Used *</Label>
                <select
                  id="partUsed"
                  className="w-full border rounded-md p-2 bg-white dark:bg-gray-800"
                  value={formData.partUsed}
                  onChange={(e) => setFormData({ ...formData, partUsed: e.target.value })}
                >
                  <option value="root">Root</option>
                  <option value="rhizome">Rhizome</option>
                  <option value="leaf">Leaf</option>
                  <option value="flower">Flower</option>
                  <option value="fruit">Fruit</option>
                  <option value="seed">Seed</option>
                  <option value="bark">Bark</option>
                </select>
              </div>
              <div>
                <Label htmlFor="quantityKg">Quantity (kg) *</Label>
                <Input
                  id="quantityKg"
                  type="number"
                  step="0.01"
                  required
                  value={formData.quantityKg}
                  onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                  placeholder="100.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="collectionDate">Collection Date *</Label>
              <Input
                id="collectionDate"
                type="date"
                required
                value={formData.collectionDate}
                onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
              />
            </div>

            <div>
              <Label className="flex items-center justify-between mb-2">
                <span>Geo-Location *</span>
                <Button type="button" size="sm" variant="outline" onClick={getCurrentLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Current Location
                </Button>
              </Label>
              <div className="grid md:grid-cols-2 gap-4">
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weatherConditions">Weather Conditions</Label>
                <Input
                  id="weatherConditions"
                  value={formData.weatherConditions}
                  onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                  placeholder="Sunny, 28°C"
                />
              </div>
              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Input
                  id="soilType"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  placeholder="Red laterite"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wildHarvested"
                  checked={formData.wildHarvested}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, wildHarvested: !!checked })
                  }
                />
                <Label htmlFor="wildHarvested" className="cursor-pointer">
                  Wild Harvested
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="organicCertified"
                  checked={formData.organicCertified}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, organicCertified: !!checked })
                  }
                />
                <Label htmlFor="organicCertified" className="cursor-pointer">
                  Organic Certified
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Recording..." : "Record Collection Event"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}