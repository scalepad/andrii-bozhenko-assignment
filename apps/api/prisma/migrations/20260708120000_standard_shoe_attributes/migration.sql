ALTER TABLE "ListingAttribute" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'CUSTOM';

UPDATE "ListingAttribute" SET "kind" = 'STANDARD', "key" = 'SIZE'
WHERE lower("key") = 'size';
UPDATE "ListingAttribute" SET "kind" = 'STANDARD', "key" = 'COLOR'
WHERE lower("key") = 'color';
UPDATE "ListingAttribute" SET "kind" = 'STANDARD', "key" = 'STYLE'
WHERE lower("key") = 'style';
UPDATE "ListingAttribute" SET "kind" = 'STANDARD', "key" = 'UPPER_MATERIAL'
WHERE lower("key") IN ('material', 'upper material');

CREATE UNIQUE INDEX "ListingAttribute_one_standard_key"
ON "ListingAttribute"("listingId", "key") WHERE "kind" = 'STANDARD';
