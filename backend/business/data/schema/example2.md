datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

model User {
id String @id @default(uuid())
email String @unique
username String @unique
bio String?
image String?
password String
articles Article[]
comments Comment[]
whoIsFollowing Follower[] @relation("Follower")
following Follower[] @relation("Following")
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
@@index([email, username])
}

model Follower {
userId String
followingId String
whoIsFollowing User @relation("Follower", fields: [followingId], references: [id])
following User @relation("Following", fields: [userId], references: [id])
@@id([userId, followingId])
}

model Tag {
id String @id @default(uuid())
name String @unique
articles Article[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Article {
id String @id @default(uuid())
authorId String
author User @relation(fields: [authorId], references: [id])
slug String @unique
title String @unique
description String
body String
tagList Tag[]
comments Comment[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Comment {
id Int @id @default(autoincrement())
body String
articleId String
article Article @relation(fields: [articleId], references: [id])
authorId String
author User @relation(fields: [authorId], references: [id])
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

    © 2021 GitHub, Inc.
    Terms
    Privacy
    Security
    St