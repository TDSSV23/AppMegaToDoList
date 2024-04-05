import { createStackNavigator } from '@react-navigation/stack';
import Home from './Home';
import Lista from './Lista';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator screenOptions={ {headerShown: false, }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Lista" component={Lista} />
      {/* Outras telas... */}
    </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;