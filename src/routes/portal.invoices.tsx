import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Download, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT, INVOICES, getAccount, type DemoInvoice } from "@/data/portal";
import { money } from "@/data/products";
import { services } from "@/lib/adapters/mock";
import type { PaymentIntentResult, PaymentMethodKind } from "@/lib/adapters/types";

export const Route = createFileRoute("/portal/invoices")({
  component: Invoices;
});

function Invoices() {
  return null;
}
