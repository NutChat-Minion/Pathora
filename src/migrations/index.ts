import * as migration_20261126_164402_initial from './20261126_164402_initial';
import * as migration_20261127_025818_listing_images from './20261127_025818_listing_images';

export const migrations = [
  {
    up: migration_20261126_164402_initial.up,
    down: migration_20261126_164402_initial.down,
    name: '20261126_164402_initial',
  },
  {
    up: migration_20261127_025818_listing_images.up,
    down: migration_20261127_025818_listing_images.down,
    name: '20261127_025818_listing_images'
  },
];
