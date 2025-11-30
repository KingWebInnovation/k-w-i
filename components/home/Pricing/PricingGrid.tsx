"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

import styles from "./PricingGrid.module.css";
import { MessageCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import PricingCard from "./PricingCard";
import { PackageDTO } from "@/lib/interface/interface";
import PlanModal from "@/components/PlanModal";

export default function PriceCardGrid() {
  const { data, isLoading, isError } = useQuery<PackageDTO[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await axios.get<PackageDTO[]>("/api/packages");
      return res.data;
    },
  });

  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PackageDTO | null>(null);

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium">Loading packages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600">
        <p className="text-lg font-semibold">⚠️ Failed to load packages.</p>
        <p className="mt-2 text-sm text-red-500">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>
        <div>
          <h2>
            King Web Innovation <span>Plans</span> for Every Business
          </h2>
          <p>
            From tailored websites to comprehensive digital growth solutions,
            King Web Innovation offers transparent, flexible pricing that grows
            with your business.
          </p>
        </div>

        <div className={styles.grid}>
          {data?.map((plan) => (
            <PricingCard
              key={plan._id}
              plan={plan}
              onSelect={setSelectedPlan} // ✅ opens modal
            />
          ))}
        </div>

        <p className={styles.customNote}>
          Looking for a truly custom solution? We craft web experiences tailored
          to your vision.
        </p>

        <a
          href="https://wa.me/19414480584"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.talkLink}
        >
          <MessageCircle size={18} />
          Talk to Our Team
        </a>

        {!isAdmin && selectedPlan && (
          <PlanModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </div>
    </section>
  );
}
