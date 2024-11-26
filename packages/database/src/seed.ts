import { PrismaClient } from '../prisma/prisma-client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

async function main() {
  // Crear 5 colecciones
  const collections = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.collection.create({
        data: {
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
        },
      })
    )
  );

  // Crear 10 productos
  const products = await Promise.allSettled(
    Array.from({ length: 10 }).map(() =>
      prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.lorem.paragraph(),
          image: faker.image.url(),
          collections: {
            connect: collections.map((collection) => ({
              id: collection.id,
            })),
          },
        },
      })
    )
  );

  // Filtrar productos cumplidos correctamente
  const fulfilledProducts = products
    .filter(
      (result): result is PromiseFulfilledResult<{
        id: number;
        name: string;
        description: string | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
      }> => result.status === 'fulfilled'
    )
    .map((result) => result.value);

  // Crear 20 variantes
  const variants = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.variant.create({
        data: {
          productId: faker.helpers.arrayElement(fulfilledProducts).id,
          name: faker.commerce.productAdjective(),
          description: faker.lorem.sentence(),
          image: faker.image.url(),
          sku: faker.string.alphanumeric(10),
          price: faker.number.int({ min: 1000, max: 10000 }),
          stock: faker.number.int({ min: 1, max: 100 }),
        },
      })
    )
  );

  // Crear 5 opciones
  const options = await Promise.allSettled(
    Array.from({ length: 5 }).map(() =>
      prisma.option.create({
        data: {
          productId: faker.helpers.arrayElement(fulfilledProducts).id,
          name: faker.commerce.productMaterial(),
        },
      })
    )
  );

  // Filtrar opciones cumplidas correctamente
  const fulfilledOptions = options
    .filter(
      (result): result is PromiseFulfilledResult<{
        id: number;
        productId: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      }> => result.status === 'fulfilled'
    )
    .map((result) => result.value);

  // Crear 15 valores de opciones
  const optionValues = await Promise.all(
    Array.from({ length: 15 }).map(() =>
      prisma.optionValue.create({
        data: {
          optionId: faker.helpers.arrayElement(fulfilledOptions).id,
          value: faker.helpers.arrayElement(colors),
        },
      })
    )
  );

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
