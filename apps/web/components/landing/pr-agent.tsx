"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, GitPullRequest, Code, Github } from "lucide-react";

type LogType = "info" | "success" | "error";

type HowItWorksStep = {
  icon: any;
  label: string;
  title: string;
  desc: string;
  logs: {
    delay: number;
    type: LogType;
    text: string;
  }[];
};

const howItWorksSteps: HowItWorksStep[] = [
  {
    icon: Github,
    label: "Continue with GitHub",
    title: "Seamless Authentication.",
    desc: "Sign in effortlessly using your GitHub account to give CodeUnicorn secure access without complex setup.",
    logs: [
      { delay: 1, type: "info", text: "[AUTH] Initiating OAuth flow..." },
      { delay: 1.5, type: "info", text: "[AUTH] Exchanging auth code for tokens..." },
      { delay: 2.5, type: "success", text: "> Profile synced. Access granted." },
    ]
  },
  {
    icon: Database,
    label: "Connect Repo",
    title: "Repository Indexing.",
    desc: "Link any repository to be fully indexed. We parse your codebase architecture and map out dependencies using advanced embeddings.",
    logs: [
      { delay: 1, type: "info", text: "[WEBHOOK] Repository connection established." },
      { delay: 1.5, type: "info", text: "[INDEX] Parsing AST and embedding logic..." },
      { delay: 2.5, type: "success", text: "> Vector map generated. Codebase indexed." },
    ]
  },
  {
    icon: GitPullRequest,
    label: "Create Pull Request",
    title: "Automated Triggers.",
    desc: "Simply open a pull request as you normally would. CodeUnicorn automatically catches the webhook and begins contextual analysis.",
    logs: [
      { delay: 1, type: "info", text: "[EVENT] Pull Request #42 opened." },
      { delay: 1.5, type: "info", text: "[TASK] Fetching diff from target branch..." },
      { delay: 2.0, type: "success", text: "> Diff acquired. Ready for analysis." },
    ]
  },
  {
    icon: Code,
    label: "Reviews & Comments",
    title: "Intelligent Feedback.",
    desc: "AI reviews your code, identifying subtle bugs and suggesting architectural improvements directly in your GitHub PR timeline.",
    logs: [
      { delay: 1, type: "info", text: "[RAG] Embedding distance matched: Session logic." },
      { delay: 1.5, type: "error", text: "> Finding: Missing cleanup on session close." },
      { delay: 2.5, type: "success", text: "[ACTION] Review comment published to GitHub." },
    ]
  }
];

export function PRAgent() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative py-32 px-6 md:px-20 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-light mb-6">How It <span className="font-serif italic text-white/50">Works</span></h2>
        <p className="text-foreground/50 text-lg">From connection to automated reviews in four simple steps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Left Diagram */}
        <div className="relative rounded-xl border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_40%)] opacity-[0.05]" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-12">PR Review Workflow</h3>

          <div className="flex-1 flex flex-col justify-center gap-4 md:gap-2 relative z-10 w-full max-w-sm mx-auto">
            {howItWorksSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <WorkflowNode
                  icon={step.icon}
                  label={step.label}
                  active={activeStep === idx}
                  onClick={() => setActiveStep(idx)}
                />
                {idx < howItWorksSteps.length - 1 && (
                  <div className="w-[1px] h-8 md:h-12 bg-white/10 mx-auto relative transition-colors duration-500">
                    {activeStep >= idx && (
                      <motion.div
                        layoutId={`flow-line-${idx}`}
                        className="absolute inset-0 bg-gradient-to-b from-primary to-transparent"
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Dynamic Content */}
        <div className="relative flex flex-col gap-8">
          <div className="min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-4xl font-light mb-4">{howItWorksSteps[activeStep]?.title}</h2>
                <p className="text-foreground/50 text-lg max-w-md">{howItWorksSteps[activeStep]?.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step Video */}
          <div className="w-full aspect-video rounded-xl border border-white/10 bg-black/20 relative overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <video
                  ref={(el) => {
                    if (el) {
                      el.currentTime = 0;
                      el.play().catch(() => { });
                    }
                  }}
                  src={`/part${activeStep + 1}.mp4`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </AnimatePresence>
            {/* Subtle vignette overlay for polished edge */}
            <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.15)]" />
          </div>

        </div>

      </div>
    </section>
  );
}

function WorkflowNode({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 text-left cursor-pointer ${active ? 'border-emerald-800 bg-emerald-800/20 scale-105' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
    >
      <div className={`p-2 rounded-md ${active ? 'bg-emerald-900/60 text-emerald-400' : 'bg-white/10 text-white/50'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`font-mono text-sm ${active ? 'text-emerald-400' : 'text-white/70'}`}>{label}</span>
    </motion.button>
  );
}

// Keeping this around if terminal log functionality is brought back later
export function TerminalLine({ children, delay, type = "info", className = "" }: { children: React.ReactNode, delay: number, type?: "info" | "success" | "error", className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.4 }}
      viewport={{ once: true }}
      className={`mb-2 ${type === 'info' ? 'text-white/60' : type === 'success' ? 'text-primary' : 'text-red-400'} ${className}`}
    >
      {children}
    </motion.div>
  );
}
