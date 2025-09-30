export async function fetchData() {
  try {
    const response = await $fetch("/data.json");
    return response || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
