import React from "react";
import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {icon ? <div className="text-accent">{icon}</div> : null}
        <div>
          <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">{value}</div>
          <div className="mt-1 font-retro text-lg text-muted">{label}</div>
        </div>
      </div>
    </Card>
  );
};
