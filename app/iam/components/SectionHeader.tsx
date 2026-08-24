type SectionHeaderProps = {
  title: string;
  description?: string;
};

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      {description && (
        <p className="mt-2 text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}