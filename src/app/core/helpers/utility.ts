import { Preferences } from '@capacitor/preferences';

export async function getLocalStorageData(key: string) {
    const { value: rawValue } = await Preferences.get({ key });

    if (!rawValue) {
        return { value: undefined, type: undefined };
    }

    const [value, type, question] = JSON.parse(rawValue)[0].split(';');

    return { value, type, question };
}

export async function setlocalStorageData(key: string, value: string, type: string, question: string|null) {

    if (value) {
        value = `${value};${type};${question}`;
        value = JSON.stringify([value]);

    }
    await Preferences.set({
        key: key,
        value: value,
    });
}

export async function removeLocalStorageData(key: string) {
    await Preferences.remove({ key });
}