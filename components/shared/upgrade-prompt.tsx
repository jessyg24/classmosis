"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Osmo from "@/components/shared/osmo";

interface UpgradePromptProps {
  feature: string;
  title: string;
  description: string;
}

export default function UpgradePrompt({ feature, title, description }: UpgradePromptProps) {
  return (
    <Card className="p-cm-8 bg-cm-teal-light/30 rounded-cm-card border border-cm-teal/20 text-center" data-feature={feature}>
      <div className="mx-auto mb-4">
        <Osmo size={48} />
      </div>
      <h3 className="text-cm-label text-cm-text-primary mb-1">{title}</h3>
      <p className="text-cm-body text-cm-text-secondary mb-4">{description}</p>
      <div className="flex justify-center gap-3">
        <Link href="/settings?tab=billing">
          <Button className="bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button">
            Upgrade to Pro
          </Button>
        </Link>
        <Link href="/#pricing">
          <Button variant="outline" className="rounded-cm-button border-cm-teal text-cm-teal">
            Learn more
          </Button>
        </Link>
      </div>
    </Card>
  );
}
