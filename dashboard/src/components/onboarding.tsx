"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Welcome to Aegis Nexus",
    description: "This is your agent economy dashboard. It shows how AI agents earn, spend, and trade with each other in real-time.",
  },
  {
    title: "Money Flow",
    description: "The flow diagram shows payments moving between agents. Green means profitable, red means spending more than earning.",
  },
  {
    title: "Try It Live",
    description: "Click 'Run Economy Cycle' to simulate a supply chain transaction. The dashboard updates in real-time with auto-refresh.",
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("aegis-onboarding-seen");
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("aegis-onboarding-seen", "true");
  };

  if (!show) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl p-8 shadow-2xl">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-emerald-400" : "bg-white/10"}`} />
          ))}
        </div>

        <h2 className="text-xl font-bold mb-2">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">{current.description}</p>

        <div className="flex justify-between items-center">
          <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground">
            Skip
          </button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={dismiss} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30">
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
