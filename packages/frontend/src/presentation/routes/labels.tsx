import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/labels')({
  component: LabelsPage,
});

function LabelsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Labels</h1>
      <p className="mt-2 text-muted-foreground">Label management coming soon...</p>
    </div>
  );
}
