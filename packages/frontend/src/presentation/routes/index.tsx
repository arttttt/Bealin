import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Bealin</h1>
        <p className="mt-2 text-gray-600">Linear-style UI for Beads</p>
      </div>
    </div>
  );
}
