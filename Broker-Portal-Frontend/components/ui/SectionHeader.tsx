interface SectionHeaderProps {
  title: string;
  description: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 style={{ fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5, color: "#1FC3EB" }}>{title}</h2>
      <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.5, marginTop: "0.25rem" }}>{description}</p>
    </div>
  );
}
