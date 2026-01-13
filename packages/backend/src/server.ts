import Fastify from 'fastify';

const server = Fastify({
  logger: true,
});

server.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  const host = process.env['HOST'] ?? '0.0.0.0';

  try {
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
