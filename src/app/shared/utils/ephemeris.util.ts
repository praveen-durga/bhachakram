export function formatDegreeInRasi(longitude: number): string {
  const degreeInRasi = longitude % 30;
  const degrees = Math.floor(degreeInRasi);
  const minutes = Math.floor((degreeInRasi - degrees) * 60);
  return `${degrees}°${minutes.toString().padStart(2, '0')}'`;
}

export function calculateD9Rasi(longitude: number): number {
  const rasi = Math.floor(longitude / 30);
  const degreeInRasi = longitude % 30;
  const navamsaIndex = Math.floor(degreeInRasi / (30 / 9));

  const modality = rasi % 3;
  const startRasi = modality === 0 ? rasi : modality === 1 ? (rasi + 8) % 12 : (rasi + 4) % 12;

  return (startRasi + navamsaIndex) % 12;
}
