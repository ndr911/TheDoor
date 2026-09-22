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
};

export default function DiscoverScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const [selectedRating, setSelectedRating] = useState<string | null>(null);

  // Temporary filter values.
  // These allow the user to select filters and then
  // press APPLY before they affect the results.
  const [pendingPrice, setPendingPrice] = useState<number | null>(null);

  const [pendingRating, setPendingRating] = useState<string | null>(null);

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    setLoading(true);

    const { data, error } = await supabase
      .from("venues")
      .select(
        "id, name, neighborhood, rating, category, image_url, price_level",
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

  function openFilters() {
    setPendingPrice(selectedPrice);
    setPendingRating(selectedRating);
    setFilterOpen(true);
  }

  function applyFilters() {
    setSelectedPrice(pendingPrice);
    setSelectedRating(pendingRating);
    setFilterOpen(false);
  }

  function clearFilters() {
    setPendingPrice(null);
    setPendingRating(null);
    setSelectedPrice(null);
    setSelectedRating(null);
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

      /*
       * SEARCH
       */

      const matchesSearch =
        !search ||
        venue.name.toLowerCase().includes(search) ||
        venue.neighborhood?.toLowerCase().includes(search) ||
        venue.category?.toLowerCase().includes(search);

      /*
       * CATEGORY
       */

      const matchesCategory =
        selectedCategory === "ALL" ||
        venue.category?.toUpperCase() === selectedCategory;

      /*
       * PRICE
       *
       * We support either:
       * "$"
       * "$$"
       * "$$$"
       * "$$$$"
       *
       * If your Supabase price_level is stored as
       * a number instead, this also handles that.
       */

      let matchesPrice = true;

      if (selectedPrice !== null) {
        matchesPrice = Number(venue.price_level) === selectedPrice;
      }
      /*
       * RATING
       */

      let matchesRating = true;

      if (selectedRating && venue.rating !== null) {
        const minimumRating = Number(selectedRating.replace("+", ""));

        matchesRating = Number(venue.rating) >= minimumRating;
      }

      /*
       * If a rating filter is selected and the venue
       * has no rating, don't include it.
       */

      if (selectedRating && venue.rating === null) {
        matchesRating = false;
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [venues, searchText, selectedCategory, selectedPrice, selectedRating]);

  const activeFilterCount = (selectedPrice ? 1 : 0) + (selectedRating ? 1 : 0);

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
              placeholderTextColor="#77727C"
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
                      onPress={() => {
                        if (pendingPrice === price.value) {
                          setPendingPrice(null);
                        } else {
                          setPendingPrice(price.value);
                        }
                      }}
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

              {/* DISTANCE */}

              <Text style={[styles.filterHeading, styles.ratingHeading]}>
                DISTANCE
              </Text>

              <View style={styles.distanceComingSoon}>
                <Text style={styles.distanceComingSoonText}>
                  DISTANCE FILTER COMING SOON
                </Text>
              </View>

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
              <ActivityIndicator size="small" color="#C9A45C" />

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
          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/home")}
          >
            <Text style={styles.navIcon}>⌂</Text>

            <Text style={styles.navText}>HOME</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/explore")}
          >
            <View style={styles.activeNavIndicator} />

            <Text style={styles.navIconActive}>⌕</Text>

            <Text style={styles.navTextActive}>EXPLORE</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/saved")}
          >
            <Text style={styles.navIcon}>♡</Text>

            <Text style={styles.navText}>SAVED</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.navIcon}>○</Text>

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
    backgroundColor: "#0B0A0F",
  },

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 110,
  },

  header: {
    marginBottom: 4,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 12,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 13,
    marginBottom: 14,
  },

  subtitle: {
    color: "#96919B",
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "CormorantGaramond_500Medium",
  },

  searchWrapper: {
    height: 54,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 27,
  },

  searchIcon: {
    color: "#C9A45C",
    fontSize: 26,
    marginLeft: 15,
    marginRight: 2,
    transform: [{ rotate: "-15deg" }],
  },

  search: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    color: "#F5F1E8",
    fontSize: 14,
    fontFamily: "CormorantGaramond_500Medium",
  },

  categories: {
    paddingVertical: 20,
    gap: 9,
  },

  category: {
    height: 34,
    borderWidth: 1,
    borderColor: "#332E38",
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryActive: {
    borderColor: "#C9A45C",
    backgroundColor: "#1A1710",
  },

  categoryText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.6,
  },

  categoryTextActive: {
    color: "#C9A45C",
  },

  /* FILTER BUTTON */

  filterButton: {
    height: 42,
    borderWidth: 1,
    borderColor: "#332E38",
    backgroundColor: "#111016",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  filterButtonActive: {
    borderColor: "#C9A45C",
    backgroundColor: "#1A1710",
  },

  filterButtonText: {
    color: "#96919B",
    fontSize: 9,
    letterSpacing: 2.2,
  },

  filterButtonTextActive: {
    color: "#C9A45C",
  },

  filterChevron: {
    color: "#77727C",
    fontSize: 13,
    marginLeft: 8,
  },

  filterChevronOpen: {
    transform: [{ rotate: "180deg" }],
    color: "#C9A45C",
  },

  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  filterCountText: {
    color: "#0B0A0F",
    fontSize: 9,
    fontWeight: "700",
  },

  /* FILTER PANEL */

  filterPanel: {
    backgroundColor: "#141219",
    borderWidth: 1,
    borderColor: "#29242F",
    padding: 17,
    marginTop: 10,
    marginBottom: 14,
  },

  filterHeading: {
    color: "#F5F1E8",
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
    borderColor: "#332E38",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  filterOptionActive: {
    borderColor: "#C9A45C",
    backgroundColor: "#1A1710",
  },

  filterOptionText: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1,
  },

  filterOptionTextActive: {
    color: "#C9A45C",
  },

  distanceComingSoon: {
    height: 36,
    borderWidth: 1,
    borderColor: "#29242F",
    alignItems: "center",
    justifyContent: "center",
  },

  distanceComingSoonText: {
    color: "#5F5A64",
    fontSize: 8,
    letterSpacing: 1.4,
  },

  filterActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 24,
  },

  clearButton: {
    flex: 1,
    height: 43,
    borderWidth: 1,
    borderColor: "#332E38",
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.8,
  },

  applyButton: {
    flex: 1,
    height: 43,
    backgroundColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
  },

  applyButtonText: {
    color: "#0B0A0F",
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
    borderTopColor: "#29242F",
    paddingTop: 20,
    marginTop: 10,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#F5F1E8",
    fontSize: 12,
    letterSpacing: 3,
  },

  sectionCount: {
    color: "#C9A45C",
    fontSize: 9,
    letterSpacing: 2,
  },

  /* VENUE CARD */

  venueCard: {
    backgroundColor: "#141219",
    borderWidth: 1,
    borderColor: "#29242F",
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
    color: "#D9B65E",
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
    borderColor: "#C9A45C",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  star: {
    color: "#D9B65E",
    fontSize: 18,
    fontWeight: "600",
  },

  imageRatingText: {
    color: "#F5F1E8",
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
    color: "#F5F1E8",
    fontSize: 21,
    lineHeight: 24,
    fontFamily: "CormorantGaramond_500Medium",
    textTransform: "uppercase",
  },

  neighborhood: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 7,
  },

  priceText: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 6,
  },

  arrow: {
    color: "#C9A45C",
    fontSize: 23,
    fontWeight: "200",
  },

  /* LOADING */

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },

  loadingText: {
    color: "#77727C",
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
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
  },

  emptyText: {
    color: "#77727C",
    fontSize: 14,
    textAlign: "center",
    marginTop: 11,
    lineHeight: 21,
    fontFamily: "CormorantGaramond_500Medium",
  },

  emptyClear: {
    borderWidth: 1,
    borderColor: "#C9A45C",
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 18,
  },

  emptyClearText: {
    color: "#C9A45C",
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
    height: 78,
    backgroundColor: "#0B0A0F",
    borderTopWidth: 1,
    borderTopColor: "#29242F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 5,
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
    backgroundColor: "#C9A45C",
  },

  navIcon: {
    color: "#77727C",
    fontSize: 23,
    lineHeight: 25,
  },

  navIconActive: {
    color: "#C9A45C",
    fontSize: 23,
    lineHeight: 25,
  },

  navText: {
    color: "#77727C",
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  navTextActive: {
    color: "#C9A45C",
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
  },
});
