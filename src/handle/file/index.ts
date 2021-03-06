import { ASuccessFn } from './type';

export class FileHandle {
    async readJson(file: File, onError?: AFn) {
        try {
            return await new Promise((resolve) => this.readFile(file, resolve));
        } catch (e) {
            onError?.(e);
        }
    }

    saveJson(data: AObj, fileName: string, timeStamp: boolean = false): void {
        const { Url } = this;
        const jsonData = JSON.stringify(data);
        const blobData = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
        const blobUrl: string = Url.createObjectURL(blobData);
        this.createAnchorElem(blobUrl, fileName, timeStamp).click();
        Url.revokeObjectURL(blobUrl);
    }

    //// Helper Fn
    readFile(file: File, onLoadFn: ASuccessFn): void {
        const reader = new FileReader();
        reader.addEventListener('load', this.onFileLoad(onLoadFn));
        reader.addEventListener('error', this.onFileError);
        reader.readAsText(file);
    }

    onFileLoad(callback: ASuccessFn): AFn {
        const evtHandler = ({ target }: ProgressEvent<FileReader>) => {
            const parsedData = JSON.parse(target.result as string);
            callback(parsedData);
            target.removeEventListener('load', evtHandler);
        };
        return evtHandler;
    }

    onFileError({ target }: ProgressEvent<FileReader>): void {
        throw target.error;
    }

    createAnchorElem(blobUrl: string, fileName: string, timeStamp: boolean = false): HTMLAnchorElement {
        const dataStr: string = timeStamp ? `_${this.dateStr}` : '';
        const $link = document.createElement('a');
        $link.href = blobUrl;
        $link.target = '_blank';
        $link.download = `${fileName}${dataStr}.json`;
        return $link;
    }

    get dateStr(): string {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        return yyyy + mm + dd;
    }

    get Url() {
        return URL || webkitURL;
    }
}