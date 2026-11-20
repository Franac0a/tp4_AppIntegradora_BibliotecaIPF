import { CameraView, type BarcodeScanningResult, type BarcodeSettings } from 'expo-camera';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, radios, tamanios } from '../constants/tema';
import { buscarPorIsbn, esIsbnValido } from '../lib/catalogo';
import { TarjetaAviso } from './TarjetaAviso';

const AJUSTES_ESCANER: BarcodeSettings = { barcodeTypes: ['ean13'] };

type Props = {
  onLibroEncontrado: (isbn: string) => void;
};

export function VisorEscaner({ onLibroEncontrado }: Props) {
  // useRef y no useState: el cambio se ve en el mismo instante, sin esperar un render.
  // onBarcodeScanned llega varias veces por segundo con el mismo código.
  const navegando = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);
  const [desconocido, setDesconocido] = useState<string | null>(null);

  function alLeerCodigo({ data }: BarcodeScanningResult) {
    if (navegando.current) {
      return;
    }
    if (esIsbnValido(data) && buscarPorIsbn(data)) {
      navegando.current = true;
      onLibroEncontrado(data);
      return;
    }
    // Mismo código desconocido frente a la cámara: no repetimos el aviso.
    if (ultimoDesconocido.current === data) {
      return;
    }
    ultimoDesconocido.current = data;
    setDesconocido(data);
  }

  return (
    <View style={styles.contenedor}>
      <CameraView
        style={styles.camara}
        facing="back"
        barcodeScannerSettings={AJUSTES_ESCANER}
        onBarcodeScanned={alLeerCodigo}
      />
      <View style={styles.marco}>
        <View style={styles.visor} />
      </View>
      <Text style={styles.ayuda}>Apuntá al código de barras de la contratapa.</Text>
      {desconocido ? (
        <TarjetaAviso
          texto={`El código ${desconocido} no está en el catálogo. Probá con otro libro.`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },
  camara: {
    height: tamanios.visorEscaner + espaciado.xxl * 2,
    borderRadius: radios.lg,
    overflow: 'hidden',
  },
  marco: {
    ...StyleSheet.absoluteFill,
    height: tamanios.visorEscaner + espaciado.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  visor: {
    width: tamanios.visorEscaner,
    height: tamanios.visorEscaner / 2,
    borderWidth: 2,
    borderColor: colores.primario,
    borderRadius: radios.md,
  },
  ayuda: {
    color: colores.textoSecundario,
    fontSize: fuentes.chica,
    textAlign: 'center',
  },
});
