import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed rodando...');

  // Exemplo: criar um usuário de teste
  const user = await prisma.user.create({
    data: {
      email: `teste@prisma.ai`,
      name: 'Usuário Teste',
      role: 'USER',
    },
  });

  console.log('Usuário criado:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
