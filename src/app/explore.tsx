import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const FALLBACK_IMAGE = require("../../assets/the_door_venue_placeholder.jpg");

const COLORS = {
  background: "#0B0A0F",
  card: "#141219",
  surface: "#17141C",
  border: "#29242F",
  borderLight: "#332E38",
  gold: "#C9A45C",
  goldBright: "#D9B65E",
  cream: "#F5F1E8",
  muted: "#77727C",
  mutedLight: "#96919B",
};

const categories = ["ALL", "COCKTAILS", "SPEAKEASIES", "ROOFTOPS"];

const priceOptions = [
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];

const ratingOptions = ["4.5+", "4.0+", "3.5+"];

type Venue = {
  id: string;
  name: string;
  neighborhood: string | null;
  rating: number | null;
  category: string | null;
  image_url: string | null;
  price_level: number | null;
  zip_code: string | null;
};

export default function DiscoverScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Temporary filter values.
  const [pendingPrice, setPendingPrice] = useState<number | null>(null);
  const [pendingRating, setPendingRating] = useState<string | null>(null);
  const [pendingZip, setPendingZip] = useState<string | null>(null);

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    setLoading(true);

    const { data, error } = await supabase
      .from("venues")
      .select(
        "id, name, neighborhood, rating, category, image_url, price_level, zip_code",
      )
      .order("rating", { ascending: false });

    if (error) {
      console.log("Error loading venues:", error.message);
      setLoading(false);
      return;
    }

    setVenues(data ?? []);
    setLoading(false);
  }

  async function getUserLocation() {
    setLocationLoading(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocationError("Location permission is required.");
      setLocationLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const zip = address?.postalCode;

      if (!zip) {
        setLocationError("Couldn't determine your ZIP code.");
        setLocationLoading(false);
        return;
      }

      setPendingZip(zip);
    } catch (error) {
      console.log("Error getting location:", error);
      setLocationError("Couldn't determine your location.");
    } finally {
      setLocationLoading(false);
    }
  }

  function openFilters() {
    setPendingPrice(selectedPrice);
    setPendingRating(selectedRating);
    setPendingZip(selectedZip);
    setFilterOpen(true);
  }

  function applyFilters() {
    setSelectedPrice(pendingPrice);
    setSelectedRating(pendingRating);
    setSelectedZip(pendingZip);
    setFilterOpen(false);
  }

  function clearFilters() {
    setPendingPrice(null);
    setPendingRating(null);
    setPendingZip(null);

    setSelectedPrice(null);
    setSelectedRating(null);
    setSelectedZip(null);
  }

  function togglePrice(price: number) {
    if (pendingPrice === price) {
      setPendingPrice(null);
    } else {
      setPendingPrice(price);
    }
  }

  function toggleRating(rating: string) {
    if (pendingRating === rating) {
      setPendingRating(null);
    } else {
      setPendingRating(rating);
    }
  }

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const search = searchText.trim().toLowerCase();

      const matchesSearch =
        !search ||
        venue.name.toLowerCase().includes(search) ||
        venue.neighborhood?.toLowerCase().includes(search) ||
        venue.category?.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "ALL" ||
        venue.category?.toUpperCase() === selectedCategory;

      let matchesPrice = true;

      if (selectedPrice !== null) {
        matchesPrice = Number(venue.price_level) === selectedPrice;
      }

      let matchesRating = true;

      if (selectedRating && venue.rating !== null) {
        const minimumRating = Number(selectedRating.replace("+", ""));
        matchesRating = Number(venue.rating) >= minimumRating;
      }

      if (selectedRating && venue.rating === null) {
        matchesRating = false;
      }

      let matchesLocation = true;

      if (selectedZip) {
        matchesLocation = venue.zip_code === selectedZip;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesLocation
      );
    });
  }, [
    venues,
    searchText,
    selectedCategory,
    selectedPrice,
    selectedRating,
    selectedZip,
  ]);

  const activeFilterCount =
    (selectedPrice ? 1 : 0) + (selectedRating ? 1 : 0) + (selectedZip ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>THE DOOR</Text>

            <Text style={styles.title}>EXPLORE</Text>

            <View style={styles.goldLine} />

            <Text style={styles.subtitle}>Find what's behind the door.</Text>
          </View>

          {/* SEARCH */}

          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              style={styles.search}
              placeholder="Search bars, cocktails, neighborhoods..."
              placeholderTextColor={COLORS.muted}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* CATEGORY FILTERS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[styles.category, isActive && styles.categoryActive]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* FILTER BUTTON */}

          <Pressable
            style={[
              styles.filterButton,
              filterOpen && styles.filterButtonActive,
            ]}
            onPress={() => {
              if (filterOpen) {
                setFilterOpen(false);
              } else {
                openFilters();
              }
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterOpen && styles.filterButtonTextActive,
              ]}
            >
              FILTER
            </Text>

            {activeFilterCount > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}

            <Text
              style={[
                styles.filterChevron,
                filterOpen && styles.filterChevronOpen,
              ]}
            >
              ↓
            </Text>
          </Pressable>

          {/* FILTER PANEL */}

          {filterOpen && (
            <View style={styles.filterPanel}>
              {/* PRICE */}

              <Text style={styles.filterHeading}>PRICE</Text>

              <View style={styles.filterOptions}>
                {priceOptions.map((price) => {
                  const active = pendingPrice === price.value;

                  return (
                    <Pressable
                      key={price.value}
                      onPress={() => togglePrice(price.value)}
                      style={[
                        styles.filterOption,
                        active && styles.filterOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          active && styles.filterOptionTextActive,
                        ]}
                      >
                        {price.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* RATING */}

              <Text style={[styles.filterHeading, styles.ratingHeading]}>
                RATING
              </Text>

              <View style={styles.filterOptions}>
                {ratingOptions.map((rating) => {
                  const active = pendingRating === rating;

                  return (
                    <Pressable
                      key={rating}
                      onPress={() => toggleRating(rating)}
                      style={[
                        styles.filterOption,
                        active && styles.filterOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          active && styles.filterOptionTextActive,
                        ]}
                      >
                        {rating}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* LOCATION */}

              <Text style={[styles.filterHeading, styles.ratingHeading]}>
                LOCATION
              </Text>

              <Pressable
                style={[
                  styles.locationBar,
                  pendingZip && styles.locationBarActive,
                ]}
                onPress={getUserLocation}
                disabled={locationLoading}
              >
                <View style={styles.locationBarLeft}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={COLORS.gold}
                    style={styles.locationIcon}
                  />

                  <View>
                    <Text style={styles.locationBarLabel}>
                      {locationLoading
                        ? "FINDING YOUR LOCATION..."
                        : pendingZip
                          ? "NEAR YOU"
                          : "USE MY LOCATION"}
                    </Text>

                    {pendingZip && (
                      <Text style={styles.locationZip}>{pendingZip}</Text>
                    )}
                  </View>
                </View>

                <Text style={styles.locationArrow}>›</Text>
              </Pressable>

              {locationError && (
                <Text style={styles.locationError}>{locationError}</Text>
              )}

              {/* ACTIONS */}

              <View style={styles.filterActions}>
                <Pressable onPress={clearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>CLEAR</Text>
                </Pressable>

                <Pressable onPress={applyFilters} style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>APPLY</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* SECTION HEADER */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ALL VENUES</Text>

            <Text style={styles.sectionCount}>
              {filteredVenues.length}{" "}
              {filteredVenues.length === 1 ? "VENUE" : "VENUES"}
            </Text>
          </View>

          {/* RESULTS */}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.gold} />

              <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
            </View>
          ) : filteredVenues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>NO VENUES FOUND</Text>

              <Text style={styles.emptyText}>
                Try changing your search or filters.
              </Text>

              <Pressable
                style={styles.emptyClear}
                onPress={() => {
                  setSearchText("");
                  setSelectedCategory("ALL");
                  clearFilters();
                }}
              >
                <Text style={styles.emptyClearText}>CLEAR FILTERS</Text>
              </Pressable>
            </View>
          ) : (
            filteredVenues.map((venue) => {
              const venueImage = venue.image_url
                ? { uri: venue.image_url }
                : FALLBACK_IMAGE;

              return (
                <Pressable
                  key={venue.id}
                  style={styles.venueCard}
                  onPress={() =>
                    router.push({
                      pathname: "/venue",
                      params: {
                        id: venue.id,
                      },
                    })
                  }
                >
                  {/* IMAGE */}

                  <View style={styles.imageContainer}>
                    <Image
                      source={venueImage}
                      style={styles.venueImage}
                      resizeMode="cover"
                    />

                    <View style={styles.imageOverlay} />

                    <View style={styles.imageLabel}>
                      <Text style={styles.imageLabelText}>
                        {venue.category
                          ? venue.category.toUpperCase()
                          : "THE DOOR"}
                      </Text>
                    </View>

                    {venue.rating !== null && (
                      <View style={styles.imageRating}>
                        <Text style={styles.star}>★</Text>

                        <Text style={styles.imageRatingText}>
                          {Number(venue.rating).toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* VENUE INFO */}

                  <View style={styles.venueInfo}>
                    <View style={styles.venueMain}>
                      <Text style={styles.venueName} numberOfLines={2}>
                        {venue.name}
                      </Text>

                      <Text style={styles.neighborhood}>
                        {(venue.neighborhood ?? "NEW YORK").toUpperCase()}
                      </Text>

                      {venue.price_level !== null && (
                        <Text style={styles.priceText}>
                          {"$".repeat(venue.price_level)}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.arrow}>→</Text>
                  </View>
                </Pressable>
              );
            })
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* BOTTOM NAVIGATION */}

        <View style={styles.bottomNav}>
          {/* HOME */}

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/home")}
          >
            <Ionicons name="home-outline" size={23} color={COLORS.muted} />

            <Text style={styles.navText}>HOME</Text>
          </Pressable>

          {/* EXPLORE */}

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/explore")}
          >
            <View style={styles.activeNavIndicator} />

            <Ionicons name="search" size={23} color={COLORS.gold} />

            <Text style={styles.navTextActive}>EXPLORE</Text>
          </Pressable>

          {/* SAVED */}

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/saved")}
          >
            <Ionicons name="heart-outline" size={23} color={COLORS.muted} />

            <Text style={styles.navText}>SAVED</Text>
          </Pressable>

          {/* PROFILE */}

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-outline" size={23} color={COLORS.muted} />

            <Text style={styles.navText}>PROFILE</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    marginBottom: 4,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 12,
  },

  title: {
    color: COLORS.cream,
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 13,
    marginBottom: 14,
  },

  subtitle: {
    color: COLORS.mutedLight,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* SEARCH */

  searchWrapper: {
    height: 54,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 27,
  },

  searchIcon: {
    color: COLORS.gold,
    fontSize: 26,
    marginLeft: 15,
    marginRight: 2,
    transform: [{ rotate: "-15deg" }],
  },

  search: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    color: COLORS.cream,
    fontSize: 14,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* CATEGORIES */

  categories: {
    paddingVertical: 20,
    gap: 9,
  },

  category: {
    height: 34,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryActive: {
    borderColor: COLORS.gold,
    backgroundColor: "#1A1710",
  },

  categoryText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.6,
  },

  categoryTextActive: {
    color: COLORS.gold,
  },

  /* FILTER BUTTON */

  filterButton: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: "#111016",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  filterButtonActive: {
    borderColor: COLORS.gold,
    backgroundColor: "#1A1710",
  },

  filterButtonText: {
    color: COLORS.mutedLight,
    fontSize: 9,
    letterSpacing: 2.2,
  },

  filterButtonTextActive: {
    color: COLORS.gold,
  },

  filterChevron: {
    color: COLORS.muted,
    fontSize: 13,
    marginLeft: 8,
  },

  filterChevronOpen: {
    transform: [{ rotate: "180deg" }],
    color: COLORS.gold,
  },

  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  filterCountText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: "700",
  },

  /* FILTER PANEL */

  filterPanel: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginTop: 10,
    marginBottom: 14,
  },

  filterHeading: {
    color: COLORS.cream,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
  },

  ratingHeading: {
    marginTop: 20,
  },

  filterOptions: {
    flexDirection: "row",
    gap: 8,
  },

  filterOption: {
    minWidth: 58,
    height: 36,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  filterOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: "#1A1710",
  },

  filterOptionText: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 1,
  },

  filterOptionTextActive: {
    color: COLORS.gold,
  },

  /* LOCATION */

  locationBar: {
    height: 64,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  locationBarActive: {
    borderColor: COLORS.gold,
  },

  locationBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    marginRight: 12,
  },

  locationBarLabel: {
    color: COLORS.cream,
    fontSize: 10,
    letterSpacing: 1.5,
  },

  locationZip: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 3,
  },

  locationArrow: {
    color: COLORS.gold,
    fontSize: 24,
  },

  locationError: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 0.8,
    marginTop: 8,
  },

  /* FILTER ACTIONS */

  filterActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 24,
  },

  clearButton: {
    flex: 1,
    height: 43,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.8,
  },

  applyButton: {
    flex: 1,
    height: 43,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  applyButtonText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    marginTop: 10,
    marginBottom: 16,
  },

  sectionTitle: {
    color: COLORS.cream,
    fontSize: 12,
    letterSpacing: 3,
  },

  sectionCount: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 2,
  },

  /* VENUE CARD */

  venueCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    overflow: "hidden",
  },

  imageContainer: {
    height: 205,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#211D27",
  },

  venueImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.20)",
  },

  imageLabel: {
    position: "absolute",
    left: 17,
    bottom: 15,
  },

  imageLabelText: {
    color: COLORS.goldBright,
    fontSize: 9,
    letterSpacing: 2.5,
  },

  imageRating: {
    position: "absolute",
    right: 14,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 10, 15, 0.82)",
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  star: {
    color: COLORS.goldBright,
    fontSize: 18,
    fontWeight: "600",
  },

  imageRatingText: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
    fontFamily: "CormorantGaramond_500Medium",
  },

  venueInfo: {
    minHeight: 76,
    paddingHorizontal: 17,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  venueMain: {
    flex: 1,
    paddingRight: 12,
  },

  venueName: {
    color: COLORS.cream,
    fontSize: 21,
    lineHeight: 24,
    fontFamily: "CormorantGaramond_500Medium",
    textTransform: "uppercase",
  },

  neighborhood: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 7,
  },

  priceText: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 6,
  },

  arrow: {
    color: COLORS.gold,
    fontSize: 23,
    fontWeight: "200",
  },

  /* LOADING */

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 12,
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 55,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: COLORS.gold,
    fontSize: 12,
    letterSpacing: 3,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 11,
    lineHeight: 21,
    fontFamily: "CormorantGaramond_500Medium",
  },

  emptyClear: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 18,
  },

  emptyClearText: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 1.7,
  },

  bottomSpace: {
    height: 20,
  },

  /* BOTTOM NAVIGATION */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 0,
  },

  navItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  activeNavIndicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 1,
    backgroundColor: COLORS.gold,
  },

  navText: {
    color: COLORS.muted,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  navTextActive: {
    color: COLORS.gold,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
});
