export async function fetchAirportRisk(airportCode: string): Promise<string> {
  const response = await fetch("/api/airport-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ airportCode }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch airport info");
  }

  const data = await response.json();
  return data.content;
}
