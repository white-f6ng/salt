import { Preferences } from '@capacitor/preferences';

export async function getlocalStorageData(key: string) {
    let getSotrage = await Preferences.get({ key });
    return getSotrage;
}
export async function setlocalStorageData(key: string, value: string) {
    await Preferences.set({
        key: key,
        value: value,
    });
}