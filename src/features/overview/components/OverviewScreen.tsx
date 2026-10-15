import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Building2, CircleAlert, Coins, Factory, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import "../overview.css";

const t = copy.overview;
const caseTones = ["positive", "negative", "positive"] as const;
const marketIcons = [Building2, Landmark, Factory, Coins];

function InternalLink({ href, children }: { href: string; children: string }) {
  return <Link href={href} className="ov-link">{children}<ArrowRight aria-hidden="true" /></Link>;
}

export function OverviewScreen() {
  return <section className="eda-screen ov-screen" aria-labelledby="ov-title">
    <div className="ov-hero">
      <header>
        <p className="ov-eyebrow">{t.eyebrow}</p>
        <h1 id="ov-title">{t.title}</h1>
        <p className="ov-lead">{t.lead}</p>
      </header>
      <Card className="ov-card"><CardContent className="ov-stack">
        <h2>{t.readTitle}</h2>
        <ul className="ov-cases">{t.cases.map((item, i) => {
          const Icon = caseTones[i] === "positive" ? ArrowUpRight : ArrowDownRight;
          return <li key={item.situation} data-tone={caseTones[i]}>
            <Icon aria-hidden="true" />
            <div><p>{item.situation}</p><p className="ov-muted">{item.meaning}</p></div>
            <span className="ov-sign">{item.sign}</span>
          </li>;
        })}</ul>
        <p className="ov-note">{t.readNote}</p>
      </CardContent></Card>
    </div>

    <section className="ov-section ov-scope" aria-labelledby="ov-scope">
      <div>
        <h2 id="ov-scope">{t.scopeTitle}</h2>
        <p>{t.scopeText}</p>
        <p className="ov-count">{t.scopeCount}</p>
        <p className="ov-note">{t.scopeNote}</p>
        <InternalLink href="/data-targets">{t.scopeLink}</InternalLink>
      </div>
      <ul className="ov-markets">{t.markets.map((market, i) => {
        const Icon = marketIcons[i];
        return <li key={market.name}><Icon aria-hidden="true" /><div><p>{market.name}</p><p className="ov-muted">{market.example}</p></div></li>;
      })}</ul>
    </section>

    <section className="ov-section" aria-labelledby="ov-journey">
      <h2 id="ov-journey">{t.journeyTitle}</h2>
      <ol className="ov-steps">{t.steps.map((step, i) => <li key={step.title}>
        <span className="ov-step">{i + 1}</span>
        <h3>{step.title}</h3>
        <p className="ov-muted">{step.description}</p>
        <div className="ov-step-links">{step.links.map(([href, label]) => <InternalLink key={href} href={href}>{label}</InternalLink>)}</div>
      </li>)}</ol>
    </section>

    <section className="ov-findings" aria-labelledby="ov-findings">
      <CircleAlert aria-hidden="true" />
      <div>
        <h2 id="ov-findings">{t.findingsTitle}</h2>
        <p>{t.findings}</p>
        <p>{t.findingsScope}</p>
        <InternalLink href="/metrics">{t.findingsLink}</InternalLink>
      </div>
    </section>
  </section>;
}
