export function PresentationHeading({ title, intro }: { title: string; intro: string }) {
  return <header className="eda-heading"><h1>{title}</h1><p>{intro}</p></header>;
}
