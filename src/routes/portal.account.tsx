import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoTag } from "@/components/site/DemoTag";
import { useDemo } from "@/lib/demo-store";
import { ACCOUNT, getAccount } from "@/data/portal";

export const Route = createFileRoute("/portal/account")({
  component: AccountPage,
});

function AccountPage() {
  const { accountId } = useDemo();
  const account = getAccount(accountId) ?? ACCOUNT;
  const [company, setCompany] = useState(account.name);
  const [phone, setPhone] = useState("(775) 010-4120");

  return (
    <PortalShell
      account={account}
      title="Account"
      intro={
        <p className="measure text-sm text-muted-foreground">
          Company details, ship-to locations, terms, and portal users. Edits in demo mode stay in
          this browser and are never written anywhere.
        </p>
      }
      rail={
        <div>
          <h2 className="label-caps text-muted-foreground">Payment method</h2>
          <div className="mt-3 border border-dashed border-border p-4">
            <p className="label-caps text-muted-foreground">Placeholder</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A saved card or bank account would be stored with the payment processor as a token —
              never in this application.
            </p>
            <DemoTag tone="neutral" className="mt-3">
              No payment credentials collected
            </DemoTag>
          </div>
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="company-heading" className="panel p-5">
          <h2 id="company-heading" className="font-display text-lg font-semibold">
            Company
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="company" className="label-caps text-muted-foreground">
                Company name
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="label-caps text-muted-foreground">
                Main phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 rounded-sm"
              />
            </div>
            <dl className="spec-note space-y-1 border-t border-border pt-4">
              <div className="flex justify-between">
                <dt>ACCOUNT</dt>
                <dd className="text-foreground">{account.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt>TERMS</dt>
                <dd className="text-foreground">{account.terms}</dd>
              </div>
              <div className="flex justify-between">
                <dt>PRICE CLASS</dt>
                <dd className="text-foreground">{account.priceClass}</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Saved locally (demo)", {
                  description: "In production this would update the Acumatica customer record.",
                })
              }
            >
              Save changes
            </Button>
          </div>
        </section>

        <section aria-labelledby="ship-heading" className="panel p-5">
          <h2 id="ship-heading" className="font-display text-lg font-semibold">
            Shipping locations
          </h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {account.locations.map((loc) => (
              <li key={loc.label} className="py-3">
                <p className="text-sm font-medium">
                  {loc.label}
                  {loc.default && (
                    <DemoTag tone="neutral" className="ml-2">
                      Default
                    </DemoTag>
                  )}
                </p>
                <p className="spec-note mt-0.5">{loc.address}</p>
              </li>
            ))}
          </ul>
          <Button
            variant="rail"
            className="mt-4"
            onClick={() =>
              toast.info("Prototype only", { description: "Adding a ship-to opens a form here." })
            }
          >
            Add ship-to location
          </Button>
        </section>

        <section aria-labelledby="users-heading" className="panel p-5 lg:col-span-2">
          <h2 id="users-heading" className="font-display text-lg font-semibold">
            Portal users & roles
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">Portal users for {account.name}</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  {["Name", "Title", "Email", "Role", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="label-caps py-2.5 pr-4 text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {account.contacts.map((c) => (
                  <tr key={c.email} className="border-b border-border last:border-0">
                    <th scope="row" className="py-3 pr-4 text-left font-medium">
                      {c.name}
                    </th>
                    <td className="py-3 pr-4 text-muted-foreground">{c.title}</td>
                    <td className="spec-note py-3 pr-4">{c.email}</td>
                    <td className="py-3 pr-4">
                      <span className="label-caps text-primary">{c.role}</span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() =>
                          toast.info("Prototype only", {
                            description: `Role changes for ${c.name} stay local in demo mode.`,
                          })
                        }
                        className="label-caps text-primary hover:underline"
                      >
                        Edit role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
            {[
              ["Customer Admin", "Manages users, ship-to locations, and company details."],
              ["Buyer", "Browses private pricing, builds and submits orders."],
              ["Accounts Payable", "Views invoices and balances, initiates payment."],
            ].map(([role, text]) => (
              <div key={role}>
                <dt className="label-caps text-muted-foreground">{role}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </PortalShell>
  );
}
