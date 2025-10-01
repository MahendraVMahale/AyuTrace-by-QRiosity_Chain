"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

export default function ManufacturerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [packId, setPackId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }
    
    const role = (session.user as any).role;
    if (role !== "MANUFACTURER" && role !== "ADMIN") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    lotId: "",
    manufacturerId: "",
    sku: "",
    productName: "",
    batchNumber: "",
    manufactureDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    netWeight: "",
    dosage: "",
    storage: "",
    ayushLicense: "",
    gmpCertified: false,
  });

  const [ingredients, setIngredients] = useState<
    Array<{ name: string; percentage: string; lotId: string }>
  >([{ name: "", percentage: "", lotId: "" }]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", percentage: "", lotId: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ingredientsArray = ingredients
        .filter((ing) => ing.name && ing.percentage)
        .map((ing) => ({
          name: ing.name,
          percentage: parseFloat(ing.percentage),
          lotId: ing.lotId || undefined,
        }));

      const response = await fetch("http://localhost:4000/api/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ingredients: ingredientsArray,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQrCode(result.data.qrCodeUrl);
        setPackId(result.data.id);
        alert("Pack created successfully with QR code! ✓");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error: any) {
      alert("Failed to connect to API: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (qrCode && packId) {
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

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="p-8 text-center">
            <Package className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Pack Created Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Pack ID: {packId}</p>

            <div className="bg-white p-4 rounded-lg inline-block mb-6">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This QR code contains blockchain-verified traceability information
            </p>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>Create Another Pack</Button>
              <Link href={`/provenance/${packId}`}>
                <Button variant="outline">View Provenance</Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

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
            <Package className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold">Pack Manufacturing</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Create consumer packs with blockchain-verified QR codes
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lotId">Primary Lot ID *</Label>
                <Input
                  id="lotId"
                  required
                  value={formData.lotId}
                  onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                  placeholder="TURMERIC-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="manufacturerId">Manufacturer ID *</Label>
                <Input
                  id="manufacturerId"
                  required
                  value={formData.manufacturerId}
                  onChange={(e) => setFormData({ ...formData, manufacturerId: e.target.value })}
                  placeholder="MFG-001"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="TRM-CAP-500"
                />
              </div>
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Turmeric Capsules"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="BATCH-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="netWeight">Net Weight *</Label>
                <Input
                  id="netWeight"
                  required
                  value={formData.netWeight}
                  onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                  placeholder="60 capsules / 500mg each"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufactureDate">Manufacture Date *</Label>
                <Input
                  id="manufactureDate"
                  type="date"
                  required
                  value={formData.manufactureDate}
                  onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center justify-between mb-2">
                <span>Ingredients *</span>
                <Button type="button" size="sm" variant="outline" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </Button>
              </Label>
              <div className="space-y-3">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="%"
                        type="number"
                        step="0.1"
                        value={ing.percentage}
                        onChange={(e) => updateIngredient(index, "percentage", e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Lot ID (optional)"
                        value={ing.lotId}
                        onChange={(e) => updateIngredient(index, "lotId", e.target.value)}
                      />
                    </div>
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="dosage">Dosage Instructions</Label>
              <Textarea
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="1-2 capsules twice daily after meals"
              />
            </div>

            <div>
              <Label htmlFor="storage">Storage Instructions</Label>
              <Input
                id="storage"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                placeholder="Store in cool, dry place"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ayushLicense">AYUSH License Number</Label>
                <Input
                  id="ayushLicense"
                  value={formData.ayushLicense}
                  onChange={(e) => setFormData({ ...formData, ayushLicense: e.target.value })}
                  placeholder="AYUSH-LIC-2024-001"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gmpCertified"
                    checked={formData.gmpCertified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, gmpCertified: !!checked })
                    }
                  />
                  <Label htmlFor="gmpCertified" className="cursor-pointer">
                    GMP Certified
                  </Label>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Pack..." : "Mint Pack with QR Code"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}