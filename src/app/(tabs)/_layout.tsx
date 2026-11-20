import { Tabs } from 'expo-router/js-tabs';

import { IconoTab } from '../../components/IconoTab';
import { opcionesPestanias } from '../../constants/navegacion';

export default function LayoutPestanias() {
  return (
    <Tabs screenOptions={opcionesPestanias}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <IconoTab nombre="library" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarIcon: ({ color, size }) => <IconoTab nombre="bookmark" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
