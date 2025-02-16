npm init -y
npm install prisma typescript ts-node @prisma/client --save-dev
npx prisma init
docker-compose up -d
npx prisma migrate dev
yarn prisma migrate dev
npx prisma studio
npx prisma generate
