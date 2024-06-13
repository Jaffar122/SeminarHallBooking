import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { List, FAB, Text, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { startOfDay } from "date-fns";

const BookedTimeSlot = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getDatabase();
  const [availabilityData, setAvailabilityData] = useState([]);
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    const bookingsRef = ref(db, "bookings");

    const onDataChange = (snapshot) => {
      const bookings = snapshot.val();

      if (bookings) {
        const currentDate = new Date();

        const updatedBookings = Object.values(bookings).map((booking) => {
          const bookingEndTime = new Date(booking.endTime);

          // Calculate status
          const status =
            currentDate > bookingEndTime &&
            startOfDay(currentDate) === startOfDay(new Date(booking.date))
              ? "Expired"
              : "Booked";

          // Update status in the database
          const bookingRef = ref(db, `bookings/${booking.bookingId}`);
          update(bookingRef, { status });

          return { ...booking, status }; // Include status in the booking object
        });

        setAvailabilityData(updatedBookings);

        // Store status in the statuses state object
        const statusObj = updatedBookings.reduce((acc, booking) => {
          acc[booking.bookingId] = booking.status;
          return acc;
        }, {});
        setStatuses(statusObj);
      }
    };

    onValue(bookingsRef, onDataChange);

    // Clean up listener when component unmounts
    return () => {
      off(bookingsRef, onDataChange);
    };
  }, [auth, db]);

  const handleDeleteBooking = (bookingId) => {
    const user = auth.currentUser;
    const bookingRef = ref(db, `bookings/${bookingId}`);

    // Fetch the booking data
    get(bookingRef).then((snapshot) => {
      const booking = snapshot.val();

      // Check if the logged-in user is the one who booked the slot
      if (booking.userId === user.uid) {
        // Update the status in the local state
        setStatuses((prevStatuses) => ({
          ...prevStatuses,
          [bookingId]: "Deleted",
        }));

        // Update the status in the database
        update(bookingRef, { status: "Deleted" })
          .then(() => {
            Alert.alert("Success", "Booking deleted successfully");
          })
          .catch((error) => {
            Alert.alert("Error", "Failed to delete booking: " + error.message);
          });
      } else {
        Alert.alert(
          "Unauthorized",
          "You are not authorized to delete this booking"
        );
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {availabilityData.map((item, index) => {
          return (
            <View key={index} style={styles.bookingContainer}>
              <List.Item
                titleStyle={styles.title}
                descriptionStyle={styles.description}
                right={() => (
                  <View style={styles.container}>
                    <Text
                      style={styles.time}
                    >{`${item.startTimeString} - ${item.endTimeString}`}</Text>
                    <Text style={styles.booked}>
                      {statuses[item.bookingId]}
                    </Text>
                    {statuses[item.bookingId] === "Booked" &&
                      item.userId === auth.currentUser.uid && (
                        <IconButton
                          icon="delete"
                          color="#f00"
                          size={20}
                          onPress={() => handleDeleteBooking(item.bookingId)}
                        />
                      )}
                  </View>
                )}
                title={`${item.eventName}`}
                description={`${item.date}\nBooked by: ${
                  item.userId || "Unknown"
                }`}
              />
            </View>
          );
        })}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("Book the Slot")}
        label="For Booking"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8ecf4",
  },
  bookingContainer: {
    backgroundColor: "#ffffff",
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    elevation: 3, // Add elevation for shadow effect
  },
  time: {
    fontSize: 12,
    color: "#555",
    marginRight: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#075eec", // Change background color
  },
  booked: {
    color: "#075eec",
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#777",
  },
});

export default BookedTimeSlot;
