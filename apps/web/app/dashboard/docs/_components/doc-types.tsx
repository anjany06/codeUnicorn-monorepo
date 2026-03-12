import type { ReactNode } from "react";
import { BookOpen, Network, Users } from "lucide-react";
import type { DocType } from "@/lib/api";

export const DOC_TYPES: {
  type: DocType;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    type: "readme",
    label: "README",
    description: "Project overview, setup instructions, and usage guide",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    type: "architecture",
    label: "Architecture",
    description: "System design, component relationships, and data flow",
    icon: <Network className="h-5 w-5" />,
  },
  {
    type: "onboarding",
    label: "Onboarding Guide",
    description: "Step-by-step guide for new contributors to get started",
    icon: <Users className="h-5 w-5" />,
  },
];
