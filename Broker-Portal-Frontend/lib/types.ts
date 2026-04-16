import React from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface DashboardCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
}

export interface DashboardSection {
  title: string;
  description: string;
  cards: DashboardCard[];
}
