// Single barrel for all image assets — screens import from here, never
// require() a path directly. See assets/README.md for how to add more.

export const brand = {
  logoFullOrange: require('../../assets/brand/gomax-logo-full-orange.png'),
  logoFullNavy: require('../../assets/brand/gomax-logo-full-navy.png'),
  markOrange: require('../../assets/brand/gomax-mark-orange.png'),
  markNavy: require('../../assets/brand/gomax-mark-navy.png'),
};

// Temporary cut-outs from the C1 design export — replace with the client's product photos.
export const products = {
  pureTileP10: require('../../assets/products/pure-tile-p10.png'),
  pureSetP40: require('../../assets/products/pure-set-p40.png'),
  pureSetIS100: require('../../assets/products/pure-set-is100.png'),
  adhesivesGroup: require('../../assets/products/adhesives-group.png'),
  purepoxyHG1200: require('../../assets/products/purepoxy-hg1200.png'),
  purecreteURP: require('../../assets/products/purecrete-urp.png'),
  pureProofIWL: require('../../assets/products/pure-proof-iwl.png'),
};

// Awaiting real exports from Figma (see assets/README.md) — screens fall back
// to a solid-color/gradient placeholder when these are undefined.
export const photos: Partial<{
  onboardingMobileNumber: number;
  onboardingOtp: number;
}> = {};

export const illustrations: Partial<{
  roleMason: number;
  roleDealer: number;
  roleSalesman: number;
  birthdayCouple: number;
}> = {};
