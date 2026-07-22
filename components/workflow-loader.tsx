"use client";

import { useState, useEffect } from "react";
import { BrandLoader } from "@/components/ui/brand-loader";

interface WorkflowLoaderProps {
  show: boolean;
  messages?: string[];
}

export function WorkflowLoader({ show, messages = [] }: WorkflowLoaderProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!show || messages.length === 0) return;
    setIndex(0);
    setVisible(true);
  }, [show, messages.length]);

  useEffect(() => {
    if (!show || messages.length <= 1) return;

    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 2800);

    return () => clearInterval(cycle);
  }, [show, messages]);

  if (!show) return null;

  return (
    <BrandLoader
      withOrb
      hideTitle
      message={messages[index]}
      messageVisible={visible}
    />
  );
}
