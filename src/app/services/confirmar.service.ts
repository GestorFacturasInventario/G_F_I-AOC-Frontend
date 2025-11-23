import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmarConfig {
    titulo: string;
    mensaje: string;
    textoConfirmar: string;
    textoCancelar: string;
    tipo?: 'danger' | 'warning' | 'info' | 'success';
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmarService {
    private confirmSubject = new Subject<ConfirmarConfig & { callback: (result: boolean) => void }>();
    public confirm$ = this.confirmSubject.asObservable();

    confirm(config: ConfirmarConfig): Promise<boolean> {
        return new Promise((resolve) => {
            this.confirmSubject.next({
                ...config,
                textoConfirmar: config.textoConfirmar || 'Confirmar',
                textoCancelar: config.textoCancelar || 'Cancelar',
                tipo: config.tipo || 'info',
                callback: resolve
            });
        });
    }
}