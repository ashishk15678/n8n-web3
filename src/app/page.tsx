import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Zap,
  Workflow,
  Globe2,
  ShieldCheck,
  Users,
  BarChart4,
  Sparkles,
  Rocket,
} from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/10 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-semibold tracking-tight">n8n</div>
              <div className="text-xs text-muted-foreground">
                Premium workflow automation
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Button asChild className="shadow-md shadow-orange-500/20">
              <Link href="/signup">Start for free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-28 px-4">
          <div className="container mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm shadow-primary/10">
                <Sparkles className="h-4 w-4" />
                Premium experience inspired by n8n
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Automate, orchestrate, and scale with{" "}
                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 bg-clip-text text-transparent">
                  confidence
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Build secure, reliable workflows that connect your apps, data,
                and AI models. Visual, powerful, and ready for teams that expect
                more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="h-12 px-7 text-base shadow-lg shadow-orange-500/25"
                  asChild
                >
                  <Link href="/signup">Create your account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-base border-primary/40 hover:border-primary hover:text-foreground"
                  asChild
                >
                  <Link href="/login">View interactive demo</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  SOC2-ready security
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Real-time triggers
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-rose-500" />
                  Scales with your team
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-orange-500/20 via-amber-400/15 to-rose-500/20 rounded-3xl" />
              <div className="relative rounded-3xl border border-primary/10 bg-card/80 backdrop-blur shadow-2xl shadow-orange-500/15 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        Automation Flow
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Realtime & Secure
                      </div>
                    </div>
                  </div>
                  <span className="text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1">
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Trigger", desc: "Webhook received" },
                    { label: "Process", desc: "Transform data & call APIs" },
                    { label: "Notify", desc: "Send to Slack + Email" },
                    { label: "Store", desc: "Save to DB & CRM" },
                  ].map((item, idx) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-sm shadow-primary/5"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/10 bg-gradient-to-r from-orange-500/10 via-amber-400/10 to-rose-500/10 px-4 py-3">
                  <div>
                    <div className="font-semibold text-sm">Success rate</div>
                    <div className="text-xs text-muted-foreground">
                      Monitored & alerting enabled
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-500">
                    99.9%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-card/60 border-y border-primary/10">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                Built for reliability
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Premium-grade automation, n8n inspired
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
                Visual builder, enterprise security, and analytics—everything
                you need to ship dependable automations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              <FeatureCard
                icon={<Workflow className="h-6 w-6" />}
                title="Visual workflow studio"
                desc="Drag-and-drop builder with node search, templates, and live previews."
              />
              <FeatureCard
                icon={<Globe2 className="h-6 w-6" />}
                title="500+ native integrations"
                desc="Use ready-made nodes or connect any API with HTTP, GraphQL, or gRPC."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Real-time & scheduled"
                desc="Webhooks, CRON, queues, and event streams to trigger exactly when needed."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Security-first"
                desc="Role-based access, secrets management, audit logs, and SSO options."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Team-ready"
                desc="Spaces, versioning, approvals, and collaboration for growing teams."
              />
              <FeatureCard
                icon={<BarChart4 className="h-6 w-6" />}
                title="Observability"
                desc="Execution history, metrics, alerts, and insights to keep flows healthy."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-orange-500/10 via-amber-400/10 to-rose-500/10 p-10 shadow-xl shadow-orange-500/10">
              <h3 className="text-3xl font-bold mb-4">
                Bring premium automation to your stack
              </h3>
              <p className="text-muted-foreground mb-8">
                Start building in minutes. Switch between cloud and self-hosted
                anytime without losing control.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base shadow-lg shadow-orange-500/20"
                  asChild
                >
                  <Link href="/signup">Get started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base border-primary/40 hover:border-primary"
                  asChild
                >
                  <Link href="/login">Talk to us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-background/95 px-4 py-12">
        <div className="container mx-auto grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-rose-500 text-white flex items-center justify-center">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-lg">n8n</div>
                <div className="text-xs text-muted-foreground">
                  Premium automation platform
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Open-source spirit with a premium polish. Build reliable workflows
              that scale with your business.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: "Overview", href: "/" },
              { label: "Pricing", href: "/login" },
              { label: "Changelog", href: "https://n8n.io/changelog" },
              { label: "Status", href: "https://status.n8n.cloud" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Docs", href: "https://docs.n8n.io" },
              { label: "Templates", href: "https://n8n.io/workflows" },
              { label: "Community", href: "https://community.n8n.io" },
              { label: "Support", href: "/login" },
            ]}
          />
        </div>

        <div className="mt-10 border-t border-border/70 pt-6 text-sm text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} n8n. All rights reserved.</span>
          <div className="flex gap-6">
            <Link
              href="https://n8n.io/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="https://n8n.io/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="h-full border-primary/15 bg-background/80 backdrop-blur hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-orange-500/10">
      <CardHeader className="space-y-3">
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {desc}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
