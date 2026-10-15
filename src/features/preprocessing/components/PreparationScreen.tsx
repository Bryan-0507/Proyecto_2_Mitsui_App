import copy from "@/i18n/es.json";
import "../preparation.css";
import { BaseSteps } from "./BaseSteps";
import { ModelRoutes } from "./ModelRoutes";
import { PreparationTabs } from "./PreparationTabs";

export function PreparationScreen() {
  const t = copy.preparation;
  return <section className="metrics-page preparation-page" aria-labelledby="preparation-title">
    <header className="preparation-heading"><h1 id="preparation-title">{t.title}</h1><p>{t.intro}</p></header>
    <PreparationTabs general={<>
      <header className="preparation-section-heading"><h2 id="preparation-common">{t.commonTitle}</h2><p>{t.commonDescription}</p></header>
      <BaseSteps />
    </>} specific={<>
      <header className="preparation-section-heading"><h2 id="preparation-models">{t.branchesTitle}</h2><p>{t.branchesDescription}</p></header>
      <ModelRoutes />
    </>} />
  </section>;
}
