interface SectionHeaderProps {
  title: string;
  description: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-[#29abe2] text-base font-semibold">{title}</h2>
      <p className="text-gray-400 text-xs mt-0.5">{description}</p>
    </div>
  );
}
