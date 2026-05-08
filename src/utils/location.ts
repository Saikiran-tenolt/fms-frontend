export const getPlotCoordinates = (location: any): { lat: number | undefined, lon: number | undefined } => {
  const lat = location?.coordinates?.coordinates?.[1] ?? location?.lat;
  const lon = location?.coordinates?.coordinates?.[0] ?? location?.lng;
  return { lat, lon };
};
