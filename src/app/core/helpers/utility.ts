import { Preferences } from '@capacitor/preferences';

export async function getlocalStorageData(key: string) {
    let getLocalData = await Preferences.get({ key: key }) || "";
    return getLocalData.value;
}

export async function setlocalStorageData(key: string, value: string) {
    await Preferences.set({
        key: key,
        value: value,
    });
}