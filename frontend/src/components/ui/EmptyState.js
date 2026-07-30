export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      {icon && (
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-pine-light)] flex items-center justify-center text-2xl">
          {icon}
        </div>
      )}
      <p className="font-display text-2xl mb-2">{title}</p>
      {description && <p className="text-[var(--color-muted)] mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}
