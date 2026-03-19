-- AlterTable
ALTER TABLE "places" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationPlaceId" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "lat" SET DEFAULT 0,
ALTER COLUMN "lng" SET DEFAULT 0;
