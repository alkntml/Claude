"use client";
import { createContext, useContext } from "react";
import type { CitationEngine } from "@/lib/citations/styles";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CiteCtx {
  engine: CitationEngine;
  sources: Record<string, any>;
  onOpenSource?: (id: string) => void;
}
export const CitationContext = createContext<CiteCtx | null>(null);
export const useCitations = () => useContext(CitationContext);
