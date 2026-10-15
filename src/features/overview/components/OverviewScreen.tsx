import copy from "@/i18n/es.json";
import { StockAnimation } from "./StockAnimation";
import "../overview.css";

const t = copy.overview;

export function OverviewScreen() {
  return <section className="eda-screen ov-screen" aria-labelledby="ov-title">
    <div className="ov-introduction">
    <header className="ov-opening">
      <p className="ov-eyebrow">{t.eyebrow}</p>
      <h1 id="ov-title">{t.title}</h1>
      <p className="ov-lead">{t.lead}</p>
    </header>
    <section className="ov-question" aria-labelledby="ov-question">
      <h2 id="ov-question">{t.questionTitle}</h2>
      <p>{t.question}</p>
    </section>
    </div>
    <StockAnimation />
  </section>;
}
