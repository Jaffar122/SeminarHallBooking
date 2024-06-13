import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  TextInput,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/FontAwesome";
import { isWeekend } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const BookingScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getDatabase();

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    eventName: "",
    description: "",
    startTime: "",
    endTime: "",
    startTimeString: "",
    endTimeString: "",
    isStartTimePickerVisible: false,
    isEndTimePickerVisible: false,
  });

  const handleokPress = () => {
    navigation.navigate("Booked Time Slots");
  };

  const handleConfirmBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }
    const showStartTimePicker = () => {
      setBookingDetails({ ...bookingDetails, isStartTimePickerVisible: true });
    };

    const hideStartTimePicker = () => {
      setBookingDetails({ ...bookingDetails, isStartTimePickerVisible: false });
    };

    const handleStartTimeConfirm = (time) => {
      const formattedTime = format(time, "HH:mm");
      const startHour = time.getHours();
      const startMinute = time.getMinutes();
      const startTime = startHour + startMinute / 60;
      setBookingDetails({
        ...bookingDetails,
        startTimeString: formattedTime,
        startTime: startTime,
      });
      hideStartTimePicker();
    };

    const showEndTimePicker = () => {
      setBookingDetails({ ...bookingDetails, isEndTimePickerVisible: true });
    };

    const hideEndTimePicker = () => {
      setBookingDetails({ ...bookingDetails, isEndTimePickerVisible: false });
    };

    const handleEndTimeConfirm = (time) => {
      const formattedTime = format(time, "HH:mm");
      const endHour = time.getHours();
      const endMinute = time.getMinutes();
      const endTime = endHour + endMinute / 60;
      setBookingDetails({
        ...bookingDetails,
        endTimeString: formattedTime,
        endTime: endTime,
      });
      hideEndTimePicker();
    };

    const { date, startTime, endTime } = bookingDetails;

    // Check if the booked time is within opening hours (9:00 AM - 6:00 PM)
    if (startTime < 9 || endTime > 18) {
      Alert.alert("Error", "Slots can only be booked between 9 am and 6 pm");
      return;
    }

    // Check if there are any bookings for the specified date
    const bookingsRef = ref(db, "bookings");
    const dateBookingsRef = query(
      bookingsRef,
      orderByChild("date"),
      equalTo(date)
    );
    const dateSnapshot = await get(dateBookingsRef);
    let conflictingBooking = false;
    if (dateSnapshot.exists()) {
      // There are existing bookings for the specified date
      const dateBookings = dateSnapshot.val();
      newStartTime;
      // Check for conflicts with existing bookings
      conflictingBooking = Object.values(dateBookings).find((booking) => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        const newStartTime = startTime;
        const newEndTime = endTime;

        // Check for conflicts
        return (
          (newStartTime >= bookingStart && newStartTime < bookingEnd) ||
          (newEndTime > bookingStart && newEndTime <= bookingEnd) ||
          (newStartTime <= bookingStart && newEndTime >= bookingEnd)
        );
      });
    }

    if (conflictingBooking) {
      // Conflict found, display alert
      Alert.alert(
        "Booking Conflict",
        "The selected date and time are already booked. Please choose another slot."
      );
      return;
    }
    // No conflicts found, proceed with booking
    try {
      const bookingRef = push(bookingsRef);

      await set(bookingRef, {
        userId: user.displayName,
        date: bookingDetails.date,
        eventName: bookingDetails.eventName,
        description: bookingDetails.description,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        startTimeString: bookingDetails.startTimeString,
        endTimeString: bookingDetails.endTimeString,
        status: "Booked",
      });

      Alert.alert(
        "Congratulations",
        "Your booking is now confirmed.",
        [
          {
            text: "OK",
            onPress: handleokPress,
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const generateDisabledPastDays = () => {
    const disabledPastDays = {};
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    for (let i = 1; i < day; i++) {
      const dateString = `${year}-${month.toString().padStart(2, "0")}-${i
        .toString()
        .padStart(2, "0")}`;
      disabledPastDays[dateString] = {
        disabled: true,
        disableTouchEvent: true,
      };
    }

    return disabledPastDays;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
          <Text style={styles.label}> Date:</Text>
          <View style={styles.inputContainer}>
            <Text>
              <Calendar
                style={styles.calendar}
                current={bookingDetails.date}
                onDayPress={(day) =>
                  setBookingDetails({ ...bookingDetails, date: day.dateString })
                }
                markedDates={{
                  [bookingDetails.date]: {
                    selected: true,
                    selectedColor: "blue",
                  },
                  ...generateDisabledPastDays(), // Disable past days
                }}
                theme={{
                  calendarBackground: "#ffffff",
                  textSectionTitleColor: "#000",
                  selectedDayBackgroundColor: "#075eec",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#075eec",
                  dayTextColor: "#000",
                  textDisabledColor: "#d9e1e8",
                  arrowColor: "#075eec",
                  monthTextColor: "#075eec",
                }}
              />
            </Text>
          </View>
          <Text style={styles.label}>Event Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Event name"
            value={bookingDetails.eventName}
            onChangeText={(text) =>
              setBookingDetails({ ...bookingDetails, eventName: text })
            }
          />
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Description"
            value={bookingDetails.description}
            onChangeText={(text) =>
              setBookingDetails({ ...bookingDetails, description: text })
            }
          />
          <Text style={styles.label}> Start Time:</Text>
          <TouchableOpacity onPress={showStartTimePicker}>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>placeholder="Select Start Time"</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.label}> End Time:</Text>
          <TouchableOpacity onPress={showEndTimePicker}>
            <View style={styles.inputContainer}>
              <Text style={styles.input}>placeholder="Select End Time"</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Timing:</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM-HH:MM (Railway Timing)"
            value={bookingDetails.time}
            onChangeText={(text) => {
              if (text && text.includes("-")) {
                const [start, end] = text.split("-");
                const startHour = parseInt(start.split(":")[0]);
                const startMinute = parseInt(start.split(":")[1]);
                const endHour = parseInt(end.split(":")[0]);
                const endMinute = parseInt(end.split(":")[1]);

                const startTime = startHour + startMinute / 60;
                const endTime = endHour + endMinute / 60;
                const startTimeString = start;
                const endTimeString = end;
                setBookingDetails({
                  ...bookingDetails,
                  startTime,
                  endTime,
                  startTimeString,
                  endTimeString,
                });
              }
            }}
          />

          <View style={styles.formAction}>
            <TouchableOpacity onPress={handleConfirmBooking}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Confirm Booking</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8ecf4",
    padding: 24,
  },
  form: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#075eec",
    borderColor: "#075eec",
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  formAction: {
    marginVertical: 24,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
  calendar: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 10,
  },
});
export default BookingScreen;
