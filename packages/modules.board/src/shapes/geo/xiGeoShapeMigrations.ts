import { createShapePropsMigrationSequence, geoShapeMigrations } from '@ibodr/draw';

const GEO_SHAPE_MIGRATION_PREFIX = 'com.draw.shape.geo/';
const XI_GEO_SHAPE_MIGRATION_PREFIX = 'com.draw.shape.xi-geo/';

/** Geo migrations с id для xi-geo — иначе createDrStore падает при валидации. */
export const xiGeoShapeMigrations = createShapePropsMigrationSequence({
  sequence: geoShapeMigrations.sequence.map((migration) => {
    if (!('id' in migration)) return migration;

    return {
      ...migration,
      id: migration.id.replace(
        GEO_SHAPE_MIGRATION_PREFIX,
        XI_GEO_SHAPE_MIGRATION_PREFIX,
      ) as typeof migration.id,
    };
  }),
});
