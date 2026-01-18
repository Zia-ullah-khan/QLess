import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Import types and components from the skia folder
import type { Routes } from "../../react-native-skia-main/Routes";
import { List } from "../../react-native-skia-main/List";
import { LiquidShape } from "../../react-native-skia-main/LiquidShape";
import { DisplacementMap1 } from "../../react-native-skia-main/DisplacementMap1";
import { DisplacementMap2 } from "../../react-native-skia-main/DisplacementMap2";
import { Shader1 } from "../../react-native-skia-main/Shader1";
import { Shader2 } from "../../react-native-skia-main/Shader2";

const Stack = createStackNavigator<Routes>();

export const LiquidTestScreen = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="List"
                component={List}
                options={{
                    title: "💧 Liquid Glass",
                    // We might want to show a header or back button if this is nested in App
                    // But the original code had header: () => null. 
                    // Since this is a nested stack, let's keep it as is for now, 
                    // or maybe allow back if it's pushed from App.
                    // If 'header: () => null' is set, we can't go back easily unless we have custom UI.
                    // The original List is the "Home" of this sub-stack.
                }}
            />
            <Stack.Screen
                name="LiquidShape"
                component={LiquidShape}
                options={{
                    title: "🔘 Liquid Shape",
                }}
            />
            <Stack.Screen
                name="DisplacementMap1"
                component={DisplacementMap1}
                options={{
                    title: "🗺️  Displacement Map 1",
                }}
            />
            <Stack.Screen
                name="DisplacementMap2"
                component={DisplacementMap2}
                options={{
                    title: "🗺️  Displacement Map 2",
                }}
            />
            <Stack.Screen
                name="Shader1"
                component={Shader1}
                options={{
                    title: "🎨 Shader 1",
                }}
            />
            <Stack.Screen
                name="Shader2"
                component={Shader2}
                options={{
                    title: "🎨 Shader 2",
                }}
            />
        </Stack.Navigator>
    );
};

export default LiquidTestScreen;
