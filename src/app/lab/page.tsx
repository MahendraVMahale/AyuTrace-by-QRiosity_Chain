"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

export default function LabPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lotId: "",
    labId: "",
    testDate: new Date().toISOString().split("T")[0],
    testType: "microbial",
    certificationNumber: "",
    certificationBody: "",
    labAccreditation: "",
  });

  const [parameters, setParameters] = useState<
    Array<{ name: string; measured: string; unit: string }>
  >([{ name: "", measured: "", unit: "" }]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }
    
    const role = (session.user as any).role;
    if (role !== "LAB" && role !== "ADMIN") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const addParameter = () => {
    setParameters([...parameters, { name: "", measured: "", unit: "" }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: string, value: string) => {
    const updated = [...parameters];
    (updated[index] as any)[field] = value;
    setParameters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build parameters object
      const parametersObj: any = {};
      parameters.forEach((param) => {
        if (param.name && param.measured) {
          parametersObj[param.name] = {
            measured: isNaN(parseFloat(param.measured))
              ? param.measured
              : parseFloat(param.measured),
            unit: param.unit,
          };
        }
      });

      const response = await fetch("http://localhost:4000/api/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parameters: parametersObj,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `Quality test recorded successfully!\nStatus: ${result.data.overallStatus.toUpperCase()}`
        );
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
            <FlaskConical className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Quality Testing</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Record quality test results and compliance certification
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
                <Label htmlFor="labId">Lab ID *</Label>
                <Input
                  id="labId"
                  required
                  value={formData.labId}
                  onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                  placeholder="LAB-001"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testType">Test Type *</Label>
                <select
                  id="testType"
                  className="w-full border rounded-md p-2 bg-white dark:bg-gray-800"
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                >
                  <option value="microbial">Microbial</option>
                  <option value="heavy-metals">Heavy Metals</option>
                  <option value="pesticide">Pesticide Residue</option>
                  <option value="potency">Potency/Active Compounds</option>
                  <option value="authenticity">Authenticity</option>
                </select>
              </div>
              <div>
                <Label htmlFor="testDate">Test Date *</Label>
                <Input
                  id="testDate"
                  type="date"
                  required
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center justify-between mb-2">
                <span>Test Parameters *</span>
                <Button type="button" size="sm" variant="outline" onClick={addParameter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parameter
                </Button>
              </Label>
              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Parameter name (e.g., lead)"
                        value={param.name}
                        onChange={(e) => updateParameter(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Measured value"
                        value={param.measured}
                        onChange={(e) => updateParameter(index, "measured", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="Unit"
                        value={param.unit}
                        onChange={(e) => updateParameter(index, "unit", e.target.value)}
                        required
                      />
                    </div>
                    {parameters.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeParameter(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                System will automatically check against regulatory thresholds
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificationNumber">Certification Number</Label>
                <Input
                  id="certificationNumber"
                  value={formData.certificationNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, certificationNumber: e.target.value })
                  }
                  placeholder="CERT-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="certificationBody">Certification Body</Label>
                <Input
                  id="certificationBody"
                  value={formData.certificationBody}
                  onChange={(e) => setFormData({ ...formData, certificationBody: e.target.value })}
                  placeholder="NABL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="labAccreditation">Lab Accreditation</Label>
              <Input
                id="labAccreditation"
                value={formData.labAccreditation}
                onChange={(e) => setFormData({ ...formData, labAccreditation: e.target.value })}
                placeholder="ISO/IEC 17025:2017"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Recording..." : "Submit Quality Test"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}