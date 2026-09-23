import * as Location from "expo-location";

export async function getCurrentZipCode(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission was not granted.");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const address = addresses[0];

    if (!address?.postalCode) {
      console.log("No ZIP code found for current location.");
      return null;
    }

    return address.postalCode;
  } catch (error) {
    console.log("Error getting current ZIP code:", error);
    return null;
  }
}
