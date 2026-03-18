"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Meme = {
  id: number;
  title: string;
  url: string;
  source: string;
  view_count: number;
  flow_type: string | null;
  lifecycle_stage: string | null;
  collected_at: string;
};

const FLOW: Record<string, {label: string; color: string}> = {
  inflow:      {label: "유입",   color: "#3b82f6"},
  independent: {label: "독립",   color: "#10b981"},
  export:      {label: "역수출", color: "#f97316"},
};

const STAGE: Record<string, {label: string; color: string}> = {
  seed:   {label: "태동기", color: "#10b981"},
  spread: {label: "확산기", color: "#3b82f6"},
  peak:   {label: "고점",   color: "#f97316"},
  fade:   {label: "쇠퇴기", color: "#6b6b6b"},
};

const SOURCE: Record<string, string> = {
  reddit:  "Reddit", youtube: "YouTube",
  ruliweb: "루리웹",  ucduk:   "웃긴대학",
  naver:   "네이버",  dcinside:"디시", fmkorea:"에펨",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24​​​​​​​​​​​​​​​​
