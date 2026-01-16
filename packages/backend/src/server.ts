import 'reflect-metadata';
import Fastify from 'fastify';
import { container } from '@infrastructure/shared/di/container.js';
import { IssuesHandler } from '@presentation/http/IssuesHandler.js';
import { ProjectsHandler } from '@presentation/http/ProjectsHandler.js';
import { FileSystemHandler } from '@presentation/http/FileSystemHandler.js';

const server = Fastify({
  logger: true,
});

server.get('/health', async () => {
  return { status: 'ok' };
});

// Register API routes
const issuesHandler = container.resolve(IssuesHandler);
issuesHandler.registerRoutes(server);

const projectsHandler = container.resolve(ProjectsHandler);
projectsHandler.registerRoutes(server);

const fileSystemHandler = container.resolve(FileSystemHandler);
fileSystemHandler.registerRoutes(server);

const start = async () => {
  const port = parseInt(process.env['PORT'] ?? '4000', 10);
  const host = process.env['HOST'] ?? '0.0.0.0';

  try {
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
