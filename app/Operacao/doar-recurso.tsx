import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { criarDoacaoRecurso } from "../../lib/supabase";

export default function DoarRecurso() {
  const router = useRouter();

  const [nomeRecurso, setNomeRecurso] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!nomeRecurso || !quantidade) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      Alert.alert("Atenção", "Digite uma quantidade válida.");
      return;
    }

    setEnviando(true);

    try {
      await criarDoacaoRecurso({
        nome_recurso: nomeRecurso.trim(),
        quantidade: Number(quantidade),
      });

      Alert.alert("Sucesso", "Doação enviada!", [
        { text: "OK", onPress: () => router.push("/homepage/home") },
      ]);
    } catch (erro: any) {
      Alert.alert("Erro", erro?.message || "Não foi possível enviar a doação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("../Operacao/doacao")}
      >
        <Ionicons name="chevron-back" size={20} color="#4CAF50" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Doar recurso</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome do recurso</Text>
        <TextInput
          style={styles.input}
          value={nomeRecurso}
          onChangeText={setNomeRecurso}
          placeholder="Ex: Adubo, Regador, Enxada..."
        />

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
          placeholder="Digite a quantidade"
        />

        <TouchableOpacity
          style={styles.botaoEnviar}
          onPress={enviar}
          disabled={enviando}
        >
          <Text style={styles.botaoEnviarTexto}>
            {enviando ? "Enviando..." : "Doar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0e9",
    paddingTop: 60,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 20,
  },
  backText: {
    color: "#1c8020",
    fontWeight: "bold",
    marginLeft: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1c8020",
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 20,
  },
  form: {
    width: "85%",
  },
  label: {
    color: "#1c8020",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#A5D6A7",
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  botaoEnviar: {
    backgroundColor: "#1c8020",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 26,
  },
  botaoEnviarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
