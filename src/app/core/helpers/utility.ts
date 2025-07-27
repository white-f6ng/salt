import { Inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';

export async function getLocalStorageData(key: string) {
    const { value: rawValue } = await Preferences.get({ key });

    if (!rawValue) {
        return { value: undefined, type: undefined };
    }

    const [value, type, question] = JSON.parse(rawValue)[0].split(';');

    return { value, type, question };
}

export async function setlocalStorageData(key: string, value: string, type: string, question: string | null) {

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

export async function presentValidationAlert(validationErrors: any[], jobs: any, alertController: AlertController) {
    const errorMessages = validationErrors.map(err => {
        const questionName = jobs[0]?.questionnaire.find(
            (x: any) => x.questionId === err?.field
        )?.questionName || err?.field;

        return `${questionName}: ${err.message}\n`;
    });

    const alert = await alertController.create({
        header: 'Errors',
        message: `${errorMessages.join('\n')}`,
        cssClass: 'error-alert',
        buttons: ['OK']
    });

    await alert.present();
}
