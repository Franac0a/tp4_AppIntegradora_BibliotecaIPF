import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos } from '../constants/tema';
import { buscarPorIsbn, esIsbnValido, limpiarIsbn } from '../lib/catalogo';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';

type Props = {
  onLibroEncontrado: (isbn: string) => void;
};

// Alternativa al escáner: siempre disponible, con o sin permiso de cámara.
export function IngresoIsbn({ onLibroEncontrado }: Props) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);

  function abrir() {
    const isbn = limpiarIsbn(texto);
    if (!esIsbnValido(isbn)) {
      setError('El ISBN tiene que tener 13 números (podés escribirlo con o sin guiones).');
      return;
    }
    if (!buscarPorIsbn(isbn)) {
      setError('Ese ISBN no está en el catálogo de la biblioteca.');
      return;
    }
    setError(null);
    onLibroEncontrado(isbn);
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo} nativeID="etiqueta-isbn">
        Escribir el ISBN a mano
      </Text>
      <CampoTexto
        accessibilityLabelledBy="etiqueta-isbn"
        value={texto}
        onChangeText={(valor) => {
          setTexto(valor);
          setError(null);
        }}
        placeholder="978…"
        keyboardType="number-pad"
        returnKeyType="go"
        onSubmitEditing={abrir}
        maxLength={17}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Boton titulo="Abrir libro" variante="secundario" onPress={abrir} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.normal,
    fontWeight: pesos.medio,
  },
  error: {
    color: colores.error,
    fontSize: fuentes.chica,
  },
});
