"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, FlaskConical, Package, QrCode, Users, ShieldCheck } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white !whitespace-pre-line !w-full !h-full !not-italic !text-center !font-bold !not-italic !block !py-[3px]">AyuTrace

                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 !whitespace-pre-line">

                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/provenance-scan">
                <Button variant="outline">
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Complete Traceability for Ayurvedic Herbs
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          From field collection to consumer product - ensuring quality, authenticity, and compliance
          at every step with blockchain-verified provenance.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Get Started
            </Button>
          </Link>
          <Link href="/api-docs" target="_blank">
            <Button size="lg" variant="outline">
              API Documentation
            </Button>
          </Link>
        </div>
      </section>

      {/* Role-Based Modules */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Platform Modules
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/collector">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500 !w-full !h-full">
              <Leaf className="text-green-600 mb-4 !w-[23.1%] !h-[34px]" />
              <h4 className="text-xl font-bold mb-2 !whitespace-pre-line !text-center !w-[179px] !h-[45px]">Field Collector (Farmer)</h4>
              <p className="text-gray-600 dark:text-gray-400 !w-[179px] !h-[66px]">
                Record collection events with geo-tagging and botanical data
              </p>
            </Card>
          </Link>

          <Link href="/processor">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Processor</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Track processing stages: drying, grinding, extraction
              </p>
            </Card>
          </Link>

          <Link href="/lab">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500">
              <FlaskConical className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Quality Lab</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Conduct and record compliance testing and certification
              </p>
            </Card>
          </Link>

          <Link href="/manufacturer">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500">
              <Package className="h-12 w-12 text-orange-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Manufacturer</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Mint consumer packs with blockchain-verified QR codes
              </p>
            </Card>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Blockchain Verified</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Immutable records with Corda permissioned blockchain integration
              </p>
            </div>
            <div className="text-center">
              <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">QR Code Provenance</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Consumers can scan and verify complete product journey
              </p>
            </div>
            <div className="text-center">
              <FlaskConical className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">FHIR Compliant</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Healthcare interoperability standards for metadata
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p className="!whitespace-pre-line !whitespace-pre-line"> Ayutrace 2025 </p>
          <p className="text-sm mt-2">
            Ensuring quality and authenticity in Ayurvedic medicine supply chain
          </p>
        </div>
      </footer>
    </div>);

}