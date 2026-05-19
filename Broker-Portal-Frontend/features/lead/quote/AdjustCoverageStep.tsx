"use client";

import React, { useState, useEffect, useCallback } from "react";
import CoverSummary from "@/components/ui/CoverSummary";
import { BackButton, NextButton } from "@/components/ui/StepButtons";
import StepProgress from "@/components/ui/StepProgress";
import DownloadQuoteModal from "@/components/ui/DownloadQuoteModal";
import { getProductList, calculatePricing, type Product } from "../../../lib/api/products";
import Slider from "@/components/ui/Slider";

const QUICK_STEPS = ["Quote Details", "Adjust Cover Amounts"];

interface CoverageData {
  lifeCover: number;
  funeralCover: number;
  occupationalDisability: number;
  totalCover: number;
  totalMonthlyPremium: number;
}

interface AdjustCoverageStepProps {
  onBack: () => void;
  onGenerateQuote: (coverageData: CoverageData) => void | Promise<void>;
  onContinueToFull?: () => void;
  employeeCount: number;
  averageAge: number;
  averageIncome: number;
  province: string;
  industry: string;
  quoteReference?: string;
  companyName?: string;
  genderMix?: string;
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 400,
  color: "#9ca3af",
  display: "block",
  marginBottom: "8px",
};

const coverageItemStyle: React.CSSProperties = {
  background: "#2a2a2a",
  border: "1px solid #30363D",
  borderRadius: "8px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export default function AdjustCoverageStep({ 
  onBack, 
  onGenerateQuote, 
  onContinueToFull, 
  employeeCount,
  averageAge,
  averageIncome,
  province,
  industry,
  quoteReference,
  companyName = "",
  genderMix = "Not specified",
}: AdjustCoverageStepProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [lifeCover, setLifeCover] = useState(100000);
  const [funeralCover, setFuneralCover] = useState(50000);
  const [occupationalDisability, setOccupationalDisability] = useState(100000);
  const [totalMonthlyPremium, setTotalMonthlyPremium] = useState(0);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [benefitBreakdown, setBenefitBreakdown] = useState<any[]>([]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductList();
        setProducts(data);
        
        // Dynamically set default cover amounts from the API data
        data.forEach(p => {
          p.benefits.forEach(b => {
            const type = b.benefit_type.toUpperCase();
            if (type === "LIFE" && b.default_cover_amount) {
              setLifeCover(b.default_cover_amount);
            } else if ((type === "ACCIDENT" || type === "OCCUPATIONAL DISABILITY") && b.default_cover_amount) {
              setOccupationalDisability(b.default_cover_amount);
            } else if (type === "FUNERAL" && b.default_cover_amount) {
              setFuneralCover(b.default_cover_amount);
            }
          });
        });
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Pricing calculation - use API with fallback to estimated
  const updatePricing = useCallback(async () => {
    setIsPricingLoading(true);
    try {
      if (products.length > 0) {
        // Use calculatePricing API with products
        const payload = {
          quote_type: "Quick",
          member_count: employeeCount || 1,
          quick_quote_data: {
            workforce_count: employeeCount || 1,
            average_age: averageAge,
            average_salary: averageIncome,
            province: province,
            industry: industry,
          },
          benefits: products.flatMap(p => 
            p.benefits.map((b: any) => {
              let isSelected = false;
              let coverAmount = 0;

              const type = b.benefit_type.toUpperCase();
              if (type === "LIFE") {
                isSelected = true;
                coverAmount = lifeCover;
              } else if (type === "ACCIDENT" || type === "OCCUPATIONAL DISABILITY") {
                isSelected = true;
                coverAmount = occupationalDisability;
              } else if (type === "FUNERAL") {
                isSelected = true;
                coverAmount = funeralCover;
              }
              
              return {
                benefit_id: b.benefit_id,
                benefit_type: b.benefit_type,
                cover_amount: coverAmount,
                is_selected: isSelected
              };
            })
          )
        };

        const res = await calculatePricing(payload as any);
        setTotalMonthlyPremium(res?.data?.total_premium ?? res?.data?.total_monthly_premium ?? 0);
        if (res?.data?.benefits) {
          setBenefitBreakdown(res.data.benefits);
        }
      } else {
        // Fallback to estimated pricing
        const baseRatePerEmployee = 150;
        const lifeCoverRate = lifeCover / 100000 * 50;
        const funeralCoverRate = funeralCover / 10000 * 20;
        const disabilityRate = occupationalDisability / 50000 * 80;
        
        const estimatedMonthlyPerEmployee = baseRatePerEmployee + lifeCoverRate + funeralCoverRate + disabilityRate;
        const estimatedTotal = estimatedMonthlyPerEmployee * employeeCount;
        
        setTotalMonthlyPremium(estimatedTotal);
        setBenefitBreakdown([
          { benefit_name: "Life Cover", premium_amount: (lifeCoverRate * employeeCount), premium_rate: lifeCoverRate },
          { benefit_name: "Funeral Cover", premium_amount: (funeralCoverRate * employeeCount), premium_rate: funeralCoverRate },
          { benefit_name: "Occupational Disability", premium_amount: (disabilityRate * employeeCount), premium_rate: disabilityRate },
        ]);
      }
    } catch (error) {
      console.error("Pricing calculation failed:", error);
      // Fallback to estimated pricing on error
      const baseRatePerEmployee = 150;
      const lifeCoverRate = lifeCover / 100000 * 50;
      const funeralCoverRate = funeralCover / 10000 * 20;
      const disabilityRate = occupationalDisability / 50000 * 80;
      
      const estimatedMonthlyPerEmployee = baseRatePerEmployee + lifeCoverRate + funeralCoverRate + disabilityRate;
      const estimatedTotal = estimatedMonthlyPerEmployee * employeeCount;
      
      setTotalMonthlyPremium(estimatedTotal);
    } finally {
      setIsPricingLoading(false);
    }
  }, [lifeCover, funeralCover, occupationalDisability, employeeCount, products]);

  const totalCover = lifeCover + funeralCover + occupationalDisability;

  // Debounce pricing updates to avoid excessive API calls while adjusting sliders
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePricing();
    }, 500); // Wait 500ms after slider stops moving before calling API

    return () => clearTimeout(timer);
  }, [updatePricing]);

  const formatCurrency = (value: number) => `R ${(value || 0).toLocaleString("en-ZA")}`;

  return (
    <>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
        Quick Cost Estimate
      </h2>

      <StepProgress steps={QUICK_STEPS} currentStep={1} variant="continuous" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        flex: 1,
      }}>
        
        {/* Left side - Adjust Cover Amounts */}
        <div style={{
          background: "#1E1E1E",
          border: "1px solid #30363D",
          borderRadius: "8px",
          padding: "20px",
          height: "fit-content",
        }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
            Adjust Cover Amounts
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginBottom: "24px" }}>
            For an average of <strong style={{ color: "#1FC3EB" }}>{formatCurrency(averageIncome)}</strong> per employee p/m, each now would get:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Life Cover */}
            <div style={coverageItemStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Life cover</label>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {formatCurrency(lifeCover)}
                </span>
              </div>
              <Slider
                min={50000}
                max={2000000}
                step={10000}
                value={lifeCover}
                onChange={setLifeCover}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
                <span>R0.00</span>
                <span>R 2,000,000.00</span>
              </div>
            </div>

            {/* Funeral Cover */}
            <div style={coverageItemStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Funeral Cover</label>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {formatCurrency(funeralCover)}
                </span>
              </div>
              <Slider
                min={5000}
                max={100000}
                step={1000}
                value={funeralCover}
                onChange={setFuneralCover}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
                <span>R5,000</span>
                <span>R100,000</span>
              </div>
            </div>

            {/* Occupational Disability */}
            <div style={coverageItemStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Occupational Disability</label>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {formatCurrency(occupationalDisability)}
                </span>
              </div>
              <Slider
                min={5000}
                max={200000}
                step={1000}
                value={occupationalDisability}
                onChange={setOccupationalDisability}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
                <span>R5,000</span>
                <span>R200,000</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right side - Cover Summary */}
        <div style={{ height: "fit-content", position: "relative" }}>
          {isPricingLoading && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "12px", zIndex: 10
            }}>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1FC3EB]"></div>
            </div>
          )}
          <CoverSummary
            lifeCover={lifeCover}
            funeralCover={funeralCover}
            occupationalDisability={occupationalDisability}
            totalCover={totalCover}
            totalMonthlyPremium={totalMonthlyPremium}
          />
        </div>

      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <BackButton onClick={onBack} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {onContinueToFull && (
            <button
              onClick={onContinueToFull}
              style={{
                height: "36px", padding: "0 20px",
                borderRadius: "8px",
                border: "1px solid #ffffff",
                background: "transparent",
                color: "#ffffff",
                fontSize: "0.875rem", fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
                boxSizing: "border-box",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Continue to Full Quote
            </button>
          )}
          <NextButton label="Save & Generate Quote" onClick={async () => {
            await onGenerateQuote({ lifeCover, funeralCover, occupationalDisability, totalCover, totalMonthlyPremium });
            setShowModal(true);
          }} />
        </div>
      </div>

      {showModal && (
        <DownloadQuoteModal
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
