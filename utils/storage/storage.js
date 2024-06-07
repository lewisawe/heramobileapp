import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';

export function useAsyncStorage(key) {
  const [value, setValue] = useState(null);
  const getResource = useCallback(async () => {
    const response = await loadString(key);
    if (response) {
      setValue(response);
    }
  }, [key]);

  useEffect(() => getResource(key), [getResource, key]);

  return value;
}

export function useAsyncListStorage(keys) {
  const [listValues, setListValues] = useState([]);

  const getListResource = useCallback(async () => {
    const list = await Promise.all(keys.map(key => loadString(key)));

    if (list.length > 0) {
      setListValues(list);
    }
  }, [keys]);

  useEffect(() => {
    getListResource(keys);
  }, [getListResource, keys]);

  return [...listValues];
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null;
  }
}
/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (_a) {
    return false;
  }
}
/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load(key) {
  try {
    const almostThere = await AsyncStorage.getItem(key);
    return JSON.parse(almostThere);
  } catch (_a) {
    return null;
  }
}
/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_a) {
    return false;
  }
}
/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export async function remove(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (_a) {}
}
/**
 * Burn it all to the ground.
 */
export async function clear() {
  try {
    await AsyncStorage.clear();
  } catch (_a) {}
}
