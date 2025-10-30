import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminScreen from "./screens/AdminScreen/AdminScreen";
import LoginScreen from "./screens/AuthScreen/LoginScreen";
import RegisterScreen from "./screens/AuthScreen/RegisterScreen";
import ClientScreen from "./screens/ClientScreen/ClientScreen";

const Stack = createStackNavigator();

export default function App() {
   return (
      <SafeAreaView style={{ flex: 1 }}>
         <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
               <Stack.Screen name="Login" component={LoginScreen} />
               <Stack.Screen name="Register" component={RegisterScreen} />
               <Stack.Screen name="Client" component={ClientScreen} />
               <Stack.Screen name="Admin" component={AdminScreen} />
            </Stack.Navigator>
         </NavigationContainer>
      </SafeAreaView>
   );
}
