export async function safeFetchJson(res: Response) {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) {
      throw new Error(data.error || data.message || text || `HTTP error ${res.status}`);
    }
    return data;
  } catch (e: any) {
    if (!res.ok) {
      throw new Error(text || e.message || `HTTP error ${res.status}`);
    }
    throw new Error(`Invalid JSON response: ${text}`);
  }
}
