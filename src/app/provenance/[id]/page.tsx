"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Leaf,
  Users,
  FlaskConical,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function ProvenancePage() {
  const params = useParams();
  const packId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProvenance();
  }, [packId]);

  const fetchProvenance = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/provenance/${packId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load provenance data");
      }
    } catch (err: any) {
      setError("Failed to connect to API: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading provenance data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="border-b bg-white dark:bg-gray-800 p-4">
          <div className="container mx-auto">
            <Link href="/provenance-scan">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Scan
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pack Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/provenance-scan">
            <Button>Try Another Pack</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { pack, lot, collectionEvents, processingEvents, qualityTests, complianceStatus, blockchainVerification } = data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "fail":
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pass: "default",
      compliant: "default",
      fail: "destructive",
      "non-compliant": "destructive",
      pending: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="container mx-auto">
          <Link href="/provenance-scan">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scan
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pack.productName}</h1>
              <p className="text-gray-600 dark:text-gray-400">Pack ID: {pack.id}</p>
            </div>
            <div className="text-right">
              {getStatusBadge(complianceStatus.overallStatus)}
            </div>
          </div>

          {/* Blockchain Verification */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Blockchain Verification</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {blockchainVerification.valid
                    ? "✓ Chain integrity verified"
                    : "⚠ " + blockchainVerification.message}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="product" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Product Info */}
          <TabsContent value="product" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold">Product Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-medium">{pack.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Batch Number</p>
                  <p className="font-medium">{pack.batchNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacture Date</p>
                  <p className="font-medium">{new Date(pack.manufactureDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{new Date(pack.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Weight</p>
                  <p className="font-medium">{pack.netWeight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GMP Certified</p>
                  <p className="font-medium">{pack.gmpCertified ? "Yes ✓" : "No"}</p>
                </div>
              </div>

              {pack.dosage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Dosage</p>
                  <p className="font-medium">{pack.dosage}</p>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Ingredients</p>
                <div className="space-y-1">
                  {pack.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{ing.name}</span>
                      <span className="font-medium">{ing.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Source Lot</p>
                <p className="font-medium">
                  {lot.name} - {lot.species}
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Collection Events */}
          <TabsContent value="collection" className="space-y-4">
            {collectionEvents.map((event: any, index: number) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Leaf className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Collection Event #{index + 1}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.collectionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Species</p>
                    <p className="font-medium">{event.species}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Common Name</p>
                    <p className="font-medium">{event.commonName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Part Used</p>
                    <p className="font-medium capitalize">{event.partUsed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{event.quantityKg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Collection Method</p>
                    <p className="font-medium">
                      {event.wildHarvested ? "Wild Harvested" : "Cultivated"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organic Status</p>
                    <p className="font-medium">
                      {event.organicCertified ? "Certified ✓" : "Not Certified"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <p className="text-sm font-medium">Location</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lat: {event.location.lat.toFixed(4)}, Lng: {event.location.lng.toFixed(4)}
                  </p>
                  {event.weatherConditions && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Weather: {event.weatherConditions}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Processing Events */}
          <TabsContent value="processing" className="space-y-4">
            {processingEvents.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                No processing events recorded
              </Card>
            ) : (
              processingEvents.map((event: any, index: number) => (
                <Card key={event.id} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold capitalize">{event.processType}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.processDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Input</p>
                      <p className="font-medium">{event.inputQuantityKg} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Output</p>
                      <p className="font-medium">{event.outputQuantityKg} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yield</p>
                      <p className="font-medium">
                        {((event.outputQuantityKg / event.inputQuantityKg) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {(event.temperature || event.duration) && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {event.temperature && (
                        <div>
                          <p className="text-sm text-gray-500">Temperature</p>
                          <p className="font-medium">{event.temperature}°C</p>
                        </div>
                      )}
                      {event.duration && (
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{event.duration} minutes</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* Quality Tests */}
          <TabsContent value="quality" className="space-y-4">
            {qualityTests.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                No quality tests recorded
              </Card>
            ) : (
              qualityTests.map((test: any) => (
                <Card key={test.id} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FlaskConical className="h-6 w-6 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold capitalize">
                        {test.testType.replace("-", " ")} Test
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(test.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(test.overallStatus)}
                  </div>

                  <div className="space-y-3">
                    {Object.entries(test.parameters).map(([key, param]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium capitalize">{key.replace("_", " ")}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Measured: {param.measured} {param.unit}
                          </p>
                          {param.threshold && (
                            <p className="text-xs text-gray-500">
                              Threshold: {param.threshold.min && `Min ${param.threshold.min}`}{" "}
                              {param.threshold.max && `Max ${param.threshold.max}`} {param.threshold.unit}
                            </p>
                          )}
                        </div>
                        {getStatusIcon(param.status)}
                      </div>
                    ))}
                  </div>

                  {test.certificationNumber && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium">Certification: {test.certificationNumber}</p>
                      {test.certificationBody && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {test.certificationBody}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Compliance Report</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Status</span>
                  {getStatusBadge(complianceStatus.overallStatus)}
                </div>
              </div>

              <div className="space-y-3">
                {complianceStatus.details.map((detail: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    {getStatusIcon(detail.status)}
                    <div className="flex-1">
                      <p className="font-medium">{detail.checkpoint}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{detail.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✓ Verified by Ministry of AYUSH, Government of India
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This product has been traced through the complete supply chain
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}