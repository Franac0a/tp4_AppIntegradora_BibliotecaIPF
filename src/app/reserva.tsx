import { Redirect } from 'expo-router';

// URL de la versión anterior de la app: se mantiene para que los links viejos sigan funcionando.
export default function RedireccionReserva() {
  return <Redirect href="/reservas" />;
}
