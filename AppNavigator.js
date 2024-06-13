import React from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Front_End/screens/LoginScreen';
import BookedTimeSlot from "./Front_End/screens/BookedTimeSlot";
import SignUp from './Front_End/screens/SignUp';
import ResetPassword from './Front_End/screens/forgotpass';
import BookingScreen from './Front_End/screens/BookingScreen';


const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Reset Password" component={ResetPassword} />
        <Stack.Screen name="Booked Time Slots" component={BookedTimeSlot} />
        <Stack.Screen name="Book the Slot" component={BookingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default AppNavigator;
