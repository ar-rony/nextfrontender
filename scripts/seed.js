const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  const file = path.join(process.cwd(), 'data', 'projects.json');

  if (!fs.existsSync(file)) {
    console.error('data/projects.json not found, skipping seed.');
    process.exit(1);
  }

  const raw = fs.readFileSync(file, 'utf-8');
  const projects = JSON.parse(raw);

  for (const p of projects) {
    try {
      await prisma.project.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          category: p.category,
          summary: p.summary,
          description: p.description,
          stack: p.stack || [],
          images: p.images || [],
          preview: p.preview || null,
          link: p.link || null,
        },
        create: {
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category,
          summary: p.summary,
          description: p.description,
          stack: p.stack || [],
          images: p.images || [],
          preview: p.preview || null,
          link: p.link || null,
        },
      });
      console.log('Upserted', p.slug);
    } catch (err) {
      console.error('Failed to upsert', p.slug, err.message || err);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
