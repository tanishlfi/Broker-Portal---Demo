"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getProductList, calculatePricing, type Product } from "../../../../lib/api/products";

interface AdditionalBenefitsState {
  augmentation: boolean;
  commutingJourney: boolean;
  riotAndStrike: boolean;
  comprehensivePersonalAccident: boolean;
  classicPersonalAccident: boolean;
}

interface AdjustFullCoverStepProps {
  employeeCount: number;
  averageIncome: number;
  lifeCover: number;
  setLifeCover: (v: number) => void;
  occupationalDisability: number;
  setOccupationalDisability: (v: number) => void;
  funeralCover: number;
  setFuneralCover: (v: number) => void;
  additionalBenefits: AdditionalBenefitsState;
  setAdditionalBenefits: React.Dispatch<React.SetStateAction<AdditionalBenefitsState>>;
  province: string;
  industry: string;
  averageAge: string;
  setProductId?: (id: string) => void;
  coverMode?: "multiple" | "equal";
  setCoverMode?: (mode: "multiple" | "equal") => void;
}

export function AdjustFullCoverStep({
  employeeCount,
  averageIncome,
  lifeCover,
  setLifeCover,
  occupationalDisability,
  setOccupationalDisability,
  funeralCover,
  setFuneralCover,
  additionalBenefits,
  setAdditionalBenefits,
  province,
  industry,
  averageAge,
  setProductId,
  coverMode = "multiple",
  setCoverMode,
}: AdjustFullCoverStepProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalMonthlyPremium, setTotalMonthlyPremium] = useState(0);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [benefitBreakdown, setBenefitBreakdown] = useState<any[]>([]);

  const {
    augmentation,
    commutingJourney,
    riotAndStrike,
    comprehensivePersonalAccident,
    classicPersonalAccident,
  } = additionalBenefits;

  useEffect(() => {
    if (coverMode === "multiple") {
      setLifeCover(1.5);
      setOccupationalDisability(2.5);
    } else {
      setLifeCover(100000);
      setOccupationalDisability(100000);
    }
  }, [coverMode, setLifeCover, setOccupationalDisability]);

  useEffect(() => {
    getProductList()
      .then((data) => {
        setProducts(data);
        if (data.length > 0 && setProductId) {
          setProductId(data[0].product_id);
        }
        data.forEach((p) => {
          p.benefits.forEach((b) => {
            const type = b.benefit_type.toUpperCase();
            if (type === "FUNERAL" && b.default_cover_amount) {
              setFuneralCover(b.default_cover_amount);
            }
          });
        });
      })
      .catch(console.error);
  }, [setFuneralCover, setProductId]);

  const updatePricing = useCallback(async () => {
    if (products.length === 0) return;
    setIsPricingLoading(true);
    try {
      const payload = {
        quote_type: "Full",
        member_count: employeeCount || 1,
        quick_quote_data: {
          workforce_count: employeeCount || 1,
          average_age: parseInt(averageAge, 10) || 35,
          average_salary: averageIncome || 0,
          province: province,
          industry: industry,
        },
        benefits: products.flatMap((p) =>
          p.benefits.map((b: any) => {
            let isSelected = false;
            let coverAmount = 0;
            let multiple = 0;

            const type = b.benefit_type.toUpperCase();
            if (type === "LIFE") {
              isSelected = true;
              if (coverMode === "multiple") {
                multiple = lifeCover;
              } else {
                coverAmount = lifeCover;
              }
            } else if (type === "ACCIDENT" || type === "OCCUPATIONAL DISABILITY") {
              isSelected = true;
              if (coverMode === "multiple") {
                multiple = occupationalDisability;
              } else {
                coverAmount = occupationalDisability;
              }
            } else if (type === "FUNERAL") {
              isSelected = true;
              coverAmount = funeralCover;
            } else if (type === "VAPS") {
              if (b.benefit_name.includes("Augmentation")) isSelected = augmentation;
              if (b.benefit_name.includes("Commuting")) isSelected = commutingJourney;
              if (b.benefit_name.includes("Riot")) isSelected = riotAndStrike;
              if (b.benefit_name.includes("Personal Accident")) {
                if (b.benefit_name.includes("Comprehensive")) isSelected = comprehensivePersonalAccident;
                else isSelected = classicPersonalAccident;
              }
              coverAmount = b.default_cover_amount || 0;
            }

            return {
              benefit_id: b.benefit_id,
              benefit_type: b.benefit_type,
              cover_amount: coverAmount > 0 ? coverAmount : undefined,
              multiple: multiple > 0 ? multiple : undefined,
              is_selected: isSelected,
            };
          })
        ),
      };

      const res = await calculatePricing(payload as any);
      setTotalMonthlyPremium(res?.data?.total_premium ?? res?.data?.total_monthly_premium ?? 0);
      if (res?.data?.benefits) {
        setBenefitBreakdown(res.data.benefits);
      }
    } catch (error) {
      console.error("Pricing calculation failed:", error);
    } finally {
      setIsPricingLoading(false);
    }
  }, [
    lifeCover,
    funeralCover,
    occupationalDisability,
    additionalBenefits,
    employeeCount,
    products,
    province,
    industry,
    averageIncome,
    averageAge,
    coverMode,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePricing();
    }, 500);
    return () => clearTimeout(timer);
  }, [updatePricing]);

  const setBenefit = (key: keyof AdditionalBenefitsState, value: boolean) => {
    setAdditionalBenefits((prev) => ({ ...prev, [key]: value }));
  };

  const costPerMember = totalMonthlyPremium / Math.max(employeeCount, 1);
  const fmt = (v: number) => "R" + v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sliderCard: React.CSSProperties = {
    background: "#1B1B1B",
    border: "1px solid #2B3138",
    borderRadius: "10px",
    padding: "12px 14px",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "14px", position: "relative" }}>
      {isPricingLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              border: "2px solid #1FC3EB",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div style={{ background: "#1E1E1E", border: "1px solid #273444", borderRadius: "10px", padding: "12px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            onClick={() => setCoverMode?.("multiple")}
            style={{
              padding: "6px 10px",
              background: coverMode === "multiple" ? "#2C3239" : "transparent",
              border: "1px solid #3A4149",
              borderRadius: "6px",
              color: coverMode === "multiple" ? "#E5E7EB" : "#9CA3AF",
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            Multiple of Salary
          </button>
          <button
            onClick={() => setCoverMode?.("equal")}
            style={{
              padding: "6px 10px",
              background: coverMode === "equal" ? "#2C3239" : "transparent",
              border: "1px solid #3A4149",
              borderRadius: "6px",
              color: coverMode === "equal" ? "#E5E7EB" : "#9CA3AF",
              fontSize: "0.72rem",
              cursor: "pointer",
            }}
          >
            Equal Amount
          </button>
        </div>

        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
          Adjust Cover Amounts
        </h3>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "14px" }}>
          For an average of{" "}
          <span style={{ color: "#1FC3EB", fontWeight: 600 }}>
            R{averageIncome.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>{" "}
          per employee p/m, each one would get:
        </p>

        <div style={{ ...sliderCard, marginBottom: "10px" }}>
          <label
            style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500, display: "block", marginBottom: "8px" }}
          >
            {coverMode === "multiple"
              ? `Life cover - ${lifeCover}x annual salary (max R2M)`
              : `Life cover - R${lifeCover.toLocaleString("en-ZA")} (max R2M)`}
          </label>
          <input
            type="range"
            min={coverMode === "multiple" ? 0.5 : 50000}
            max={coverMode === "multiple" ? 5 : 2000000}
            step={coverMode === "multiple" ? 0.5 : 10000}
            value={lifeCover}
            onChange={(e) => setLifeCover(Number(e.target.value))}
            className="adjust-slider"
            style={{ width: "100%" }}
          />
          <div
            style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: "4px" }}
          >
            <span>{coverMode === "multiple" ? "0.5x annual salary" : "R50,000"}</span>
            <span>{coverMode === "multiple" ? "5x Annual Salary" : "R2,000,000"}</span>
          </div>
          <ul style={{ fontSize: "0.67rem", color: "#9ca3af", margin: "8px 0 0 0", paddingLeft: "16px" }}>
            <li>0.19% of salary up to a max of R317 per employee p/m*</li>
            <li>1 employee will be added monthly to check if they qualify for full cover.</li>
            <li>1 employees has reached the max cover limit of R2M.</li>
          </ul>
        </div>

        <div style={{ ...sliderCard, marginBottom: "10px" }}>
          <label
            style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500, display: "block", marginBottom: "8px" }}
          >
            {coverMode === "multiple"
              ? `Occupational Disability cover - ${occupationalDisability}x annual salary (max R2M)`
              : `Occupational Disability cover - R${occupationalDisability.toLocaleString("en-ZA")} (max R2M)`}
          </label>
          <input
            type="range"
            min={coverMode === "multiple" ? 0.5 : 5000}
            max={coverMode === "multiple" ? 5 : 200000}
            step={coverMode === "multiple" ? 0.5 : 1000}
            value={occupationalDisability}
            onChange={(e) => setOccupationalDisability(Number(e.target.value))}
            className="adjust-slider"
            style={{ width: "100%" }}
          />
          <div
            style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: "4px" }}
          >
            <span>{coverMode === "multiple" ? "0.5x annual salary" : "R5,000"}</span>
            <span>{coverMode === "multiple" ? "5x Annual Salary" : "R200,000"}</span>
          </div>
          <ul style={{ fontSize: "0.67rem", color: "#9ca3af", margin: "8px 0 0 0", paddingLeft: "16px" }}>
            <li>0.19% of salary up to a max of R869 per employee p/m*</li>
            <li>1 employee will be added monthly to check if they qualify for full cover.</li>
            <li>1 employees has reached the max cover limit of R2M.</li>
          </ul>
        </div>

        <div style={{ ...sliderCard, marginBottom: "12px" }}>
          <label
            style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500, display: "block", marginBottom: "8px" }}
          >
            Funeral cover - R{funeralCover.toLocaleString("en-ZA")}
          </label>
          <input
            type="range"
            min="5000"
            max="50000"
            step="1000"
            value={funeralCover}
            onChange={(e) => setFuneralCover(Number(e.target.value))}
            className="adjust-slider"
            style={{ width: "100%" }}
          />
          <div
            style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: "4px" }}
          >
            <span>R5,000</span>
            <span>R50,000</span>
          </div>
        </div>

        <h4 style={{ fontSize: "0.86rem", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
          Additional Benefits
        </h4>

        {[
          {
            label: "Augmentation - monthly income, up to 75% of earnings above the COIDA limits",
            active: augmentation,
            onToggle: (v: boolean) => setBenefit("augmentation", v),
            notes: [
              "Cover for death and disability for those employees earning above the COIDA limit of R563 520 (per annum)",
              "R860 per employee p/m (all employees qualify)",
            ],
          },
          {
            label: "Commuting Journey Policy with Crime - monthly income, up to 75% of earnings",
            active: commutingJourney,
            onToggle: (v: boolean) => setBenefit("commutingJourney", v),
            notes: [
              "Cover for death and disability occurring from an accident while travelling to and from work including cover for a crime-related accident",
              "R350 per employee p/m (all employees qualify)",
            ],
          },
          {
            label: "Riot and Strike - 2 x annual salary",
            active: riotAndStrike,
            onToggle: (v: boolean) => setBenefit("riotAndStrike", v),
            notes: [
              "Cover for injuries and death arising from riots and strikes",
              "R90 per employee p/m (all employees qualify)",
            ],
          },
          {
            label: "Comprehensive Personal Accident - up to 4 x annual salary",
            active: comprehensivePersonalAccident,
            onToggle: (v: boolean) => setBenefit("comprehensivePersonalAccident", v),
            notes: [
              "Covers accidents that result in death, temporary, permanent disability and medical expenses",
              "R1,430 per employee p/m (all employees qualify)",
            ],
          },
          {
            label: "Classic Personal Accident - up to 4 x annual salary",
            active: classicPersonalAccident,
            onToggle: (v: boolean) => setBenefit("classicPersonalAccident", v),
            notes: [],
          },
        ].map((benefit) => (
          <div key={benefit.label} style={{ marginBottom: "12px" }}>
            <label style={{ display: "flex", gap: "8px", cursor: "pointer", marginBottom: "6px" }}>
              <input
                type="checkbox"
                checked={benefit.active}
                onChange={(e) => benefit.onToggle(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#1FC3EB" }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: benefit.active ? "#d1d5db" : "#8b949e",
                  fontWeight: 500,
                }}
              >
                {benefit.label}
              </span>
            </label>
            {benefit.active && benefit.notes.length > 0 && (
              <div
                style={{
                  background: "#0F1419",
                  border: "1px solid #1F2937",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginTop: "6px",
                }}
              >
                <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#9ca3af", fontSize: "0.67rem" }}>
                  {benefit.notes.map((note) => (
                    <li key={note} style={{ marginBottom: "4px" }}>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <style>{`
          .adjust-slider {
            height: 5px;
            border-radius: 5px;
            background: #3a424d;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
          }
          .adjust-slider::-webkit-slider-thumb {
            appearance: none;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #1FC3EB;
            border: 0;
            cursor: pointer;
          }
          .adjust-slider::-moz-range-thumb {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #1FC3EB;
            border: 0;
            cursor: pointer;
          }
        `}</style>
      </div>
      <div style={{ background: "#1E1E1E", border: "1px solid #273444", borderRadius: "10px", padding: "14px" }}>
        <div
          style={{
            background: "#151515",
            border: "1px solid #2B3138",
            borderRadius: "12px",
            padding: "20px",
            height: "fit-content",
          }}
        >
          {/* TOP COVER SUMMARY */}
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "18px",
            }}
          >
            Cover summary
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {(() => {
              const getCorePremium = (keywords: string[], fallback: string) => {
                const item = benefitBreakdown.find(
                  (b) =>
                    keywords.some((k) => b.benefit_name?.toUpperCase().includes(k.toUpperCase())) ||
                    keywords.some((k) => b.benefit_type?.toUpperCase().includes(k.toUpperCase()))
                );
                return item ? `R${item.premium_amount} pm` : fallback;
              };

              const items = [
                { label: "Life", value: getCorePremium(["Life"], "R50 pm") },
                {
                  label: "Occupational Disability",
                  value: getCorePremium(["Disability", "Occupational", "Accident"], "R24 pm"),
                },
                { label: "Funeral", value: getCorePremium(["Funeral"], "R24 pm") },
                ...(augmentation ? [{ label: "Augmentation", value: "R24 pm" }] : []),
                ...(commutingJourney ? [{ label: "Commuting Journey Policy with Crime", value: "R24 pm" }] : []),
                ...(riotAndStrike ? [{ label: "Riot and Strike", value: "R24 pm" }] : []),
                ...(classicPersonalAccident ? [{ label: "Classic Personal Accident", value: "R24 pm" }] : []),
              ];

              return items.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "#A1A1AA",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "#F4F4F5",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ));
            })()}
          </div>

          {/* TOTAL PREMIUM */}
          <div
            style={{
              borderTop: "1px solid #2B3138",
              marginTop: "20px",
              paddingTop: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#A1A1AA",
                }}
              >
                Total monthly premium
              </span>

              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#00C2FF",
                }}
              >
                {fmt(totalMonthlyPremium)} pm
              </span>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: "0.72rem",
                color: "#71717A",
                marginTop: "8px",
              }}
            >
              {employeeCount} employees - average premium per employee{" "}
              <span style={{ color: "#D4D4D8" }}>{fmt(costPerMember)} p/m</span>
            </p>
          </div>

          {/* SECOND COVER SUMMARY */}
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "18px",
            }}
          >
            Cover summary
          </h3>

          {[
            ["Life", "0.1% of salary up to a max of R317 per employee p/m*"],
            ["Occupational Disability", "0.19% of salary up to a max of R69 per employee p/m*"],
            ["Funeral", "R9.00 per member"],
            ["Augmentation", "0.86% of salary per employee p/m*"],
            ["Commuting Journey Policy with Crime", "0.35% of salary per employee p/m*"],
            ["Riot and Strike", "0.09% of salary per employee p/m*"],
            ["Classic Personal Accident", "1.27% of salary per employee p/m*"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "18px",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#A1A1AA",
                  maxWidth: "45%",
                  lineHeight: 1.5,
                }}
              >
                {label}
              </span>

              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#F4F4F5",
                  textAlign: "right",
                  lineHeight: 1.5,
                }}
              >
                {value}
              </span>
            </div>
          ))}

          <div
            style={{
              borderTop: "1px solid #2B3138",
              marginTop: "16px",
              paddingTop: "14px",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                color: "#71717A",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              * The premium is capped at this value for employees who have reached the R2m max cover limit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdjustFullCoverStep;
