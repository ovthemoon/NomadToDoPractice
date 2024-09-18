import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert,Platform } from 'react-native';
import { theme } from "./colors.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';

const STORAGE_KEY = "@todos";

export default function App() {
  useEffect(() => {
    loadTodos();
    loadState();
  }, []);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState({});
  const travel = () => { setWorking(false); saveState(false); };
  const work = () => { setWorking(true); saveState(true); };
  const onChangeText = (payload) => setText(payload);
  const isDone = false;
  const isFixing = false;
  const addToDo = async () => {
    try {
      if (text === "") return;
      // const newToDos=Object.assign({},todos,{[Date.now()]:{text,working}});
      const newTodos = { ...todos, [Date.now()]: { text, working, isDone, isFixing } };
      setTodos(newTodos);
      console.log(newTodos);
      await saveTodos(newTodos);
      setText("");
    }
    catch {
      console.log("Error");
    }
  }
  const loadTodos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setTodos(JSON.parse(s));
      }
    }
    catch {
      console.log("No Todos");
    }
  }
  const saveState = async (state) => {
    //true : Working, false : Travel
    await AsyncStorage.setItem("@state", JSON.stringify(state));
    console.log("state saved");
  }
  const loadState = async () => {
    try {
      const s = await AsyncStorage.getItem("@state");
      if (s) {
        setWorking(JSON.parse(s));
      }
    } catch {
      console.log("No State");
    }
  }
  const setIsDone = async (id) => {
    const newTodos = {
      ...todos,
      [id]: {
        ...todos[id],
        isDone: !todos[id].isDone
      }
    };
    setTodos(newTodos);
    await saveTodos(newTodos);
  }
  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    console.log("Saved");
  }
  const deleteTodo = (id) => {
    if(Platform.OS==="web"){
      const ok=window.confirm("Are you sure?");
      if(ok){
        const newTodos = { ...todos };
        delete newTodos[id];
        setTodos(newTodos);
        saveTodos(newTodos);
      }
      return;
    }
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure", style: "destructive", onPress: () => {
          const newTodos = { ...todos };
          delete newTodos[id];
          setTodos(newTodos);
          saveTodos(newTodos);
        }
      },
    ]);
  }
  const fixInput = (id) => {
    const newTodos = {
      ...todos,
      [id]: {
        ...todos[id],
        isFixing: !todos[id].isFixing
      }
    }
    setTodos(newTodos);
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: working ? theme.grey : "white" }}>Travel</Text>
        </TouchableOpacity>

      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType='done'
          value={text}
          placeholder={working ? "Add a To Do" : "Where Do you want to go?"}
          style={styles.input}></TextInput>
      </View>
      <ScrollView style={styles.todoscroll}>{
        Object.keys(todos).map(key =>
          todos[key].working === working ?
            <View style={{...styles.todo,marginLeft:todos[key].isDone?50:0}} key={key} >
              {!todos[key].isFixing ?
               <Text style={{ ...styles.todotext, textDecorationLine: todos[key].isDone ? 'line-through' : 'none' }}>{todos[key].text}</Text> 
                : <TextInput value={todos[key].text} onChangeText={(payload) => {
                  todos[key].text=payload; 
                  setTodos({...todos});
                }}
               style={{ ...styles.todotext, backgroundColor:"white",color:"black", textDecorationLine: todos[key].isDone ? 'line-through' : 'none' }}></TextInput>}

              <View style={styles.buttonList}>
                <TouchableOpacity onPress={() => fixInput(key)}>
                  <FontAwesome name="exchange" size={24} color="black" paddingHorizontal={5} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsDone(key)}>
                  <AntDesign name="checksquareo" size={24} color="black" paddingHorizontal={5} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTodo(key)}>
                  <FontAwesome name="trash" size={24} color="black" paddingHorizontal={5} />
                </TouchableOpacity>
              </View>

            </View> : null
        )
      }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  btnText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold"
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
  },
  todoscroll: {
    marginTop: 20,
  },
  buttonList: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  todo: {
    backgroundColor: theme.todoBg,
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todotext: {
    color: "white",
    fontSize: 18,
  }
});
