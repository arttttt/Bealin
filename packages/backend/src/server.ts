import Fastify from 'fastify';

const HOST = process.env.HOST ?? '0.0.0.0';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

const server = Fastify({
  logger: true,
});

server.get('/health', async () => {
  return { status: 'ok' };
});

async function start(): Promise<void> {
  try {
    await server.listen({ host: HOST, port: PORT });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
