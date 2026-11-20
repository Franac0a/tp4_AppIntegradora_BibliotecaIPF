import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '../components/Boton';
import { CampoTexto } from '../components/CampoTexto';
import { colores, espaciado, fuentes } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';

export default function PantallaLogin() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  // No hace falta navegar: al cambiar la sesión, Stack.Protected quita /login
  // y habilita /mostrador.
  function ingresar() {
    if (!iniciarSesion(usuario, clave)) {
      setError('Usuario o clave incorrectos. Revisalos e intentá de nuevo.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.descripcion}>
          Acceso para el personal de la biblioteca: desde el mostrador se entregan los libros
          respetando el orden de las reservas.
        </Text>
        <CampoTexto
          accessibilityLabel="Usuario"
          placeholder="Usuario"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
        />
        <CampoTexto
          accessibilityLabel="Clave"
          placeholder="Clave"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          textContentType="password"
          onSubmitEditing={ingresar}
        />
        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <Boton titulo="Ingresar" onPress={ingresar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.xl,
    gap: espaciado.md,
  },
  descripcion: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
  error: {
    color: colores.error,
    fontSize: fuentes.normal,
  },
});
