import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
      <p className="mt-2 text-muted-foreground">Project management coming soon...</p>
    </div>
  );
}
