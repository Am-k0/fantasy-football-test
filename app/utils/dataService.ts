// utils/dataService.ts

export const fetchData = async () => {
  try {
    const data = await import('~/data/data.json');
    return data.default;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return null;
  }
};