import { FolderX } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import copy from "@/i18n/es.json";

export function MissingArtifacts({ title }: { title: string }) {
  const t = copy.missingArtifacts;
  return <section className="eda-screen" aria-labelledby="missing-title">
    <header className="eda-heading"><h1 id="missing-title">{title}</h1></header>
    <Empty className="missing-artifacts">
      <EmptyHeader>
        <EmptyMedia variant="icon"><FolderX aria-hidden="true" /></EmptyMedia>
        <EmptyTitle><h2>{t.title}</h2></EmptyTitle>
        <EmptyDescription>{t.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent><p>{t.how}</p><code>{t.command}</code></EmptyContent>
    </Empty>
  </section>;
}
